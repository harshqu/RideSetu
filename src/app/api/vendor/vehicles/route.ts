import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { Vehicle, VehicleCategory, FuelType, TransmissionType } from '@/models/Vehicle';
import { Vendor } from '@/models/Vendor';
import { Destination } from '@/models/Destination';
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
      const vendor = await Vendor.findOne({ userId: session.userId });
      if (!vendor) {
        return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
      }
      vendorId = vendor._id.toString();
    }

    const vehicles = await Vehicle.find({ vendorId: new mongoose.Types.ObjectId(vendorId) })
      .populate('destinationId', 'name slug')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      vehicles,
      count: vehicles.length,
    });
  } catch (error: any) {
    console.error('[API Vendor Vehicles GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch vehicles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    const auth = assertRole(session, ['VENDOR', 'ADMIN']);
    if (!auth.authorized || !session) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
    }

    await connectToDatabase();

    let vendor = null;
    if (session.vendorId && mongoose.Types.ObjectId.isValid(session.vendorId)) {
      vendor = await Vendor.findById(session.vendorId);
    } else if (session.userId) {
      vendor = await Vendor.findOne({ userId: session.userId });
    }

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor profile not found. Please complete onboarding first.' }, { status: 404 });
    }

    // Guard: Only VERIFIED vendors can add / publish vehicles
    if (vendor.verificationStatus !== 'VERIFIED' && session.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: `Vendor verification status is "${vendor.verificationStatus}". Only VERIFIED vendors can add vehicles.`,
          currentStatus: vendor.verificationStatus,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      brand,
      model,
      variant = '',
      category,
      year,
      color = 'Black',
      registrationNumber,
      odometer = 5000,
      fuelType = 'PETROL',
      transmission = 'MANUAL',
      description = '',
      pricePerDay,
      pricePerHour = 50,
      weeklyPrice,
      monthlyPrice,
      securityDeposit = 1000,
      kmLimitPerDay = 150,
      excessKmCharge = 4,
      deliveryAvailable = true,
      hotelDeliveryAvailable = true,
      hostelDeliveryAvailable = true,
      pickupAvailable = true,
      lateReturnFeePerHour = 100,
      helmetIncluded = true,
      roadsideAssistance = true,
      images = [],
      photos = {},
      documents = {},
      specifications = {},
    } = body;

    if (!brand || !model || !category || !year || !registrationNumber || !pricePerDay) {
      return NextResponse.json(
        { error: 'Brand, Model, Category, Year, Registration Number, and Daily Price are required.' },
        { status: 400 }
      );
    }

    // Default or resolved destination
    const destinationId = vendor.destinationId || (await Destination.findOne())?._id;

    const newVehicle = await Vehicle.create({
      vendorId: vendor._id,
      destinationId,
      brand,
      model,
      variant,
      category: category as VehicleCategory,
      year: Number(year),
      color,
      registrationNumber: registrationNumber.toUpperCase().trim(),
      odometer: Number(odometer),
      fuelType: fuelType as FuelType,
      transmission: transmission as TransmissionType,
      description,
      status: 'UNDER_REVIEW', // Enters UNDER_REVIEW state for Admin review
      isAvailable: true,
      isVerified: false,
      pricePerDay: Number(pricePerDay),
      pricePerHour: Number(pricePerHour),
      weeklyPrice: weeklyPrice ? Number(weeklyPrice) : undefined,
      monthlyPrice: monthlyPrice ? Number(monthlyPrice) : undefined,
      securityDeposit: Number(securityDeposit) || 1000,
      kmLimitPerDay: Number(kmLimitPerDay),
      excessKmCharge: Number(excessKmCharge),
      deliveryAvailable: Boolean(deliveryAvailable),
      hotelDeliveryAvailable: Boolean(hotelDeliveryAvailable),
      hostelDeliveryAvailable: Boolean(hostelDeliveryAvailable),
      pickupAvailable: Boolean(pickupAvailable),
      lateReturnFeePerHour: Number(lateReturnFeePerHour) || 100,
      helmetIncluded: Boolean(helmetIncluded),
      roadsideAssistance: Boolean(roadsideAssistance),
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80'],
      photos: {
        front: photos.front || '',
        rear: photos.rear || '',
        left: photos.left || '',
        right: photos.right || '',
        dashboard: photos.dashboard || '',
        odometer: photos.odometer || '',
      },
      documents: {
        rcDocUrl: documents.rcDocUrl || '',
        insuranceDocUrl: documents.insuranceDocUrl || '',
        pucDocUrl: documents.pucDocUrl || '',
        permitDocUrl: documents.permitDocUrl || '',
      },
      specifications: {
        engineCc: specifications.engineCc ? Number(specifications.engineCc) : 150,
        batteryCapacityKwh: specifications.batteryCapacityKwh ? Number(specifications.batteryCapacityKwh) : undefined,
        rangeKm: specifications.rangeKm ? Number(specifications.rangeKm) : undefined,
        topSpeedKmph: specifications.topSpeedKmph ? Number(specifications.topSpeedKmph) : undefined,
        seatingCapacity: specifications.seatingCapacity ? Number(specifications.seatingCapacity) : 2,
        luggageSpace: specifications.luggageSpace || 'Standard',
      },
    });

    return NextResponse.json({
      success: true,
      vehicle: newVehicle,
      message: 'Vehicle listed successfully in UNDER_REVIEW state. Awaiting RideSetu Admin approval.',
    });
  } catch (error: any) {
    console.error('[API Vendor Vehicles POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to add vehicle' }, { status: 500 });
  }
}
