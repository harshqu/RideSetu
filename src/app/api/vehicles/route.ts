import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { Vehicle } from '@/models/Vehicle';
import { Vendor } from '@/models/Vendor';
import { Destination } from '@/models/Destination';
import { Booking } from '@/models/Booking';
import { VehicleAvailability } from '@/models/VehicleAvailability';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationQuery = searchParams.get('destination');
    const categoryQuery = searchParams.get('category');
    const pickupDateTime = searchParams.get('pickupDateTime');
    const returnDateTime = searchParams.get('returnDateTime');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const transmission = searchParams.get('transmission');
    const fuelType = searchParams.get('fuelType');
    const minRating = searchParams.get('minRating');
    const maxDeposit = searchParams.get('maxDeposit');
    const deliveryAvailable = searchParams.get('delivery');
    const verifiedOnly = searchParams.get('verifiedOnly');
    const sort = searchParams.get('sort') || 'recommended';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    await connectToDatabase();

    const query: Record<string, unknown> = {
      isAvailable: true,
      isVerified: true,
    };

    // Filter by Destination (by slug or ObjectId)
    if (destinationQuery) {
      if (mongoose.Types.ObjectId.isValid(destinationQuery)) {
        query.destinationId = new mongoose.Types.ObjectId(destinationQuery);
      } else {
        const dest = await Destination.findOne({ slug: destinationQuery.toLowerCase().trim() });
        if (dest) {
          query.destinationId = dest._id;
        }
      }
    }

    // Filter by Category
    if (categoryQuery && categoryQuery !== 'ALL') {
      const categories = categoryQuery.split(',').map((c) => c.trim().toUpperCase());
      query.category = { $in: categories };
    }

    // Filter by Price range
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) (query.pricePerDay as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (query.pricePerDay as Record<string, number>).$lte = Number(maxPrice);
    }

    // Filter by Transmission
    if (transmission && transmission !== 'ALL') {
      query.transmission = transmission.toUpperCase();
    }

    // Filter by Fuel type
    if (fuelType && fuelType !== 'ALL') {
      query.fuelType = fuelType.toUpperCase();
    }

    // Filter by Rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Filter by Deposit
    if (maxDeposit) {
      query.securityDeposit = { $lte: Number(maxDeposit) };
    }

    // Filter by Delivery
    if (deliveryAvailable === 'true') {
      query.deliveryAvailable = true;
    }

    // Date Availability Filtering
    if (pickupDateTime && returnDateTime) {
      const pickup = new Date(pickupDateTime);
      const returnDate = new Date(returnDateTime);

      if (!isNaN(pickup.getTime()) && !isNaN(returnDate.getTime()) && returnDate > pickup) {
        // Find vehicle IDs with overlapping bookings
        const conflictingBookings = await Booking.find({
          bookingStatus: { $in: ['CONFIRMED', 'ACTIVE', 'PENDING'] },
          pickupDateTime: { $lt: returnDate },
          returnDateTime: { $gt: pickup },
        }).select('vehicleId').lean();

        // Find vehicle IDs with overlapping maintenance / manual blocks
        const conflictingBlocks = await VehicleAvailability.find({
          reason: { $in: ['BOOKED', 'MAINTENANCE', 'MANUAL_BLOCK', 'PERSONAL_USE'] },
          startDate: { $lt: returnDate },
          endDate: { $gt: pickup },
        }).select('vehicleId').lean();

        const unavailableVehicleIds = new Set([
          ...conflictingBookings.map((b) => b.vehicleId.toString()),
          ...conflictingBlocks.map((b) => b.vehicleId.toString()),
        ]);

        if (unavailableVehicleIds.size > 0) {
          query._id = { $nin: Array.from(unavailableVehicleIds).map((id) => new mongoose.Types.ObjectId(id)) };
        }
      }
    }

    // Sorting
    let sortOptions: Record<string, 1 | -1> = { rating: -1, totalBookings: -1 };
    if (sort === 'price_asc') sortOptions = { pricePerDay: 1 };
    else if (sort === 'price_desc') sortOptions = { pricePerDay: -1 };
    else if (sort === 'rating_desc') sortOptions = { rating: -1 };
    else if (sort === 'popular') sortOptions = { totalBookings: -1 };
    else if (sort === 'newest') sortOptions = { year: -1, createdAt: -1 };

    const skip = (page - 1) * limit;

    const [vehicles, totalCount] = await Promise.all([
      Vehicle.find(query)
        .populate('vendorId', 'businessName ownerName rating totalReviews verificationStatus deliveryRadiusKm baseDeliveryFee isTopRated')
        .populate('destinationId', 'name slug state')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Vehicle.countDocuments(query),
    ]);

    return NextResponse.json({
      vehicles,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('[API Vehicles Search Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to search vehicles' }, { status: 500 });
  }
}
