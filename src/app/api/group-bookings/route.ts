import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, getServerSession } from '@/lib/auth';
import { GroupBookingService } from '@/services/group-booking.service';
import GroupBooking from '@/models/GroupBooking';
import connectToDatabase from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req) || (await getServerSession());
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const group = await GroupBooking.findOne({
      customerId: session.userId,
      bookingStatus: { $ne: 'CANCELLED' },
    })
      .populate('vehicles.vehicleId')
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, group });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req) || (await getServerSession());
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { vehicleId, pickupDateTime, returnDateTime, pickupType, pickupLocation, dropoffLocation, groupId, deliveryLocation } = body;

    if (!vehicleId || !pickupDateTime || !returnDateTime) {
      return NextResponse.json(
        { error: 'vehicleId, pickupDateTime, and returnDateTime are required.' },
        { status: 400 }
      );
    }

    const group = await GroupBookingService.addVehicleToGroup({
      groupId,
      customerId: session.userId,
      vehicleId,
      pickupDateTime,
      returnDateTime,
      pickupType: pickupType || 'VENDOR_PICKUP',
      pickupLocation: pickupLocation || 'Dehradun City Hub',
      dropoffLocation: dropoffLocation || 'Dehradun City Hub',
      deliveryLocation,
    });

    return NextResponse.json({ success: true, group });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update group booking' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req) || (await getServerSession());
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const vehicleId = searchParams.get('vehicleId');

    if (!groupId || !vehicleId) {
      return NextResponse.json({ error: 'groupId and vehicleId are required.' }, { status: 400 });
    }

    const group = await GroupBookingService.removeVehicleFromGroup(groupId, session.userId, vehicleId);
    return NextResponse.json({ success: true, group });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to remove vehicle' }, { status: 400 });
  }
}
