import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { Vendor } from '@/models/Vendor';
import { maskPhone } from '@/lib/encryption';
import { getSessionFromRequest, assertRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const auth = assertRole(session, ['VENDOR', 'ADMIN']);
    if (!auth.authorized || !session) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
    }

    await connectToDatabase();

    let vendorId = session.vendorId;
    if (!vendorId) {
      const v = await Vendor.findOne({ userId: session.userId });
      if (!v) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
      }
      vendorId = v._id.toString();
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    const query: Record<string, any> = {
      vendorId: new mongoose.Types.ObjectId(vendorId),
    };

    if (statusFilter && statusFilter !== 'ALL') {
      query.bookingStatus = statusFilter;
    }

    const rawBookings = await Booking.find(query)
      .populate('vehicleId', 'brand model variant registrationNumber category images')
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 })
      .lean();

    // Data Minimization for Customer Privacy (Strictly omit KYC/DL credentials)
    const sanitizedBookings = rawBookings.map((b: any) => {
      const customer = b.customerId || {};
      return {
        _id: b._id,
        bookingNumber: b.bookingNumber,
        pickupDateTime: b.pickupDateTime,
        returnDateTime: b.returnDateTime,
        bookingStatus: b.bookingStatus,
        paymentStatus: b.paymentStatus,
        pickupType: b.pickupType,
        pickupLocation: b.pickupLocation,
        deliveryLocation: b.deliveryLocation,
        basePrice: b.basePrice,
        deliveryCharge: b.deliveryCharge,
        securityDeposit: b.securityDeposit,
        totalPayable: b.totalPayable,
        createdAt: b.createdAt,
        vehicle: b.vehicleId ? {
          _id: b.vehicleId._id,
          brand: b.vehicleId.brand,
          model: b.vehicleId.model,
          variant: b.vehicleId.variant,
          registrationNumber: b.vehicleId.registrationNumber,
          category: b.vehicleId.category,
          image: b.vehicleId.images?.[0] || '',
        } : null,
        customer: {
          name: customer.name || 'Customer',
          phone: customer.phone ? maskPhone(customer.phone) : '—',
          // Strictly zero customer KYC or DL data exposed here
        },
      };
    });

    return NextResponse.json({
      success: true,
      bookings: sanitizedBookings,
      count: sanitizedBookings.length,
    });
  } catch (error: any) {
    console.error('[API Vendor Bookings GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch vendor bookings' }, { status: 500 });
  }
}
