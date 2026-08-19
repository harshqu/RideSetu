import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { Vehicle } from '@/models/Vehicle';
import { Vendor } from '@/models/Vendor';
import { Booking } from '@/models/Booking';
import { getSessionFromRequest, assertRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const auth = assertRole(session, ['VENDOR', 'ADMIN']);
    if (!auth.authorized || !session) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid vehicle ID format' }, { status: 400 });
    }

    await connectToDatabase();

    const vehicle = await Vehicle.findById(id).populate('vendorId destinationId');
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // RBAC: Vendor can only access own vehicles
    if (session.role === 'VENDOR') {
      let vendorId = session.vendorId;
      if (!vendorId) {
        const v = await Vendor.findOne({ userId: session.userId });
        vendorId = v?._id.toString();
      }
      if (vehicle.vendorId._id.toString() !== vendorId) {
        return NextResponse.json({ error: 'Forbidden: You do not own this vehicle.' }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      vehicle,
    });
  } catch (error: any) {
    console.error('[API Vendor Vehicle Details Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch vehicle' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const auth = assertRole(session, ['VENDOR', 'ADMIN']);
    if (!auth.authorized || !session) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid vehicle ID format' }, { status: 400 });
    }

    await connectToDatabase();

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // RBAC: Vendor can only modify own vehicles
    if (session.role === 'VENDOR') {
      let vendorId = session.vendorId;
      if (!vendorId) {
        const v = await Vendor.findOne({ userId: session.userId });
        vendorId = v?._id.toString();
      }
      if (vehicle.vendorId.toString() !== vendorId) {
        return NextResponse.json({ error: 'Forbidden: You do not own this vehicle.' }, { status: 403 });
      }
    }

    const body = await req.json();
    const {
      pricePerDay,
      pricePerHour,
      weeklyPrice,
      monthlyPrice,
      securityDeposit,
      kmLimitPerDay,
      excessKmCharge,
      deliveryAvailable,
      hotelDeliveryAvailable,
      hostelDeliveryAvailable,
      pickupAvailable,
      lateReturnFeePerHour,
      helmetIncluded,
      roadsideAssistance,
      description,
      status, // Vendor can set 'MAINTENANCE', 'INACTIVE', or resubmit 'UNDER_REVIEW'
      photos,
      documents,
    } = body;

    // Guard: Vendor cannot self-approve to 'APPROVED'
    if (session.role === 'VENDOR' && status === 'APPROVED' && vehicle.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Forbidden: Vendors cannot directly approve their own vehicles. Admin approval required.' },
        { status: 403 }
      );
    }

    if (pricePerDay !== undefined) vehicle.pricePerDay = Number(pricePerDay);
    if (pricePerHour !== undefined) vehicle.pricePerHour = Number(pricePerHour);
    if (weeklyPrice !== undefined) vehicle.weeklyPrice = Number(weeklyPrice);
    if (monthlyPrice !== undefined) vehicle.monthlyPrice = Number(monthlyPrice);
    if (securityDeposit !== undefined) vehicle.securityDeposit = Number(securityDeposit);
    if (kmLimitPerDay !== undefined) vehicle.kmLimitPerDay = Number(kmLimitPerDay);
    if (excessKmCharge !== undefined) vehicle.excessKmCharge = Number(excessKmCharge);
    if (deliveryAvailable !== undefined) vehicle.deliveryAvailable = Boolean(deliveryAvailable);
    if (hotelDeliveryAvailable !== undefined) vehicle.hotelDeliveryAvailable = Boolean(hotelDeliveryAvailable);
    if (hostelDeliveryAvailable !== undefined) vehicle.hostelDeliveryAvailable = Boolean(hostelDeliveryAvailable);
    if (pickupAvailable !== undefined) vehicle.pickupAvailable = Boolean(pickupAvailable);
    if (lateReturnFeePerHour !== undefined) vehicle.lateReturnFeePerHour = Number(lateReturnFeePerHour);
    if (helmetIncluded !== undefined) vehicle.helmetIncluded = Boolean(helmetIncluded);
    if (roadsideAssistance !== undefined) vehicle.roadsideAssistance = Boolean(roadsideAssistance);
    if (description !== undefined) vehicle.description = description;

    if (photos) {
      vehicle.photos = { ...vehicle.photos, ...photos };
    }
    if (documents) {
      vehicle.documents = { ...vehicle.documents, ...documents };
    }

    if (status) {
      if (session.role === 'ADMIN' || ['MAINTENANCE', 'INACTIVE', 'UNDER_REVIEW'].includes(status)) {
        vehicle.status = status;
        if (status === 'MAINTENANCE' || status === 'INACTIVE') {
          vehicle.isAvailable = false;
        } else if (status === 'APPROVED') {
          vehicle.isAvailable = true;
          vehicle.isVerified = true;
        }
      }
    }

    await vehicle.save();

    return NextResponse.json({
      success: true,
      vehicle,
      message: 'Vehicle updated successfully.',
    });
  } catch (error: any) {
    console.error('[API Vendor Vehicle PATCH Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update vehicle' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    const auth = assertRole(session, ['VENDOR', 'ADMIN']);
    if (!auth.authorized || !session) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid vehicle ID format' }, { status: 400 });
    }

    await connectToDatabase();

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // RBAC: Vendor can only delete own vehicles
    if (session.role === 'VENDOR') {
      let vendorId = session.vendorId;
      if (!vendorId) {
        const v = await Vendor.findOne({ userId: session.userId });
        vendorId = v?._id.toString();
      }
      if (vehicle.vendorId.toString() !== vendorId) {
        return NextResponse.json({ error: 'Forbidden: You do not own this vehicle.' }, { status: 403 });
      }
    }

    // Guard: Cannot delete vehicle with active/confirmed bookings
    const activeBooking = await Booking.findOne({
      vehicleId: vehicle._id,
      bookingStatus: { $in: ['CONFIRMED', 'ACTIVE', 'PENDING'] },
    });

    if (activeBooking) {
      return NextResponse.json(
        { error: 'Cannot delete vehicle with active or confirmed customer bookings. Mark as INACTIVE instead.' },
        { status: 409 }
      );
    }

    await Vehicle.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Vehicle removed from fleet successfully.',
    });
  } catch (error: any) {
    console.error('[API Vendor Vehicle DELETE Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete vehicle' }, { status: 500 });
  }
}
