import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { HandoverService } from '@/services/handover.service';
import { Booking } from '@/models/Booking';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();
    const comparison = await HandoverService.getHandoverComparison(id);

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (error: any) {
    console.error('[API Handover GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch handover data' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      vehicleId,
      handoverType,
      odometerReading,
      fuelBatteryLevel,
      existingScratches = [],
      photos = {},
      helmetCount = 1,
      accessoriesGiven = [],
      customerSignatureConfirmed = true,
      customerSignatureName,
      vendorAgentName,
      remarks = '',
    } = body;

    if (!vehicleId || !handoverType || odometerReading === undefined || fuelBatteryLevel === undefined) {
      return NextResponse.json(
        { error: 'Vehicle ID, handover type, odometer reading, and fuel level are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const report = await HandoverService.recordHandover({
      bookingId: id,
      vehicleId,
      handoverType,
      odometerReading: Number(odometerReading),
      fuelBatteryLevel: Number(fuelBatteryLevel),
      existingScratches,
      photos: {
        frontUrl: photos.frontUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
        backUrl: photos.backUrl || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80',
        leftUrl: photos.leftUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
        rightUrl: photos.rightUrl || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80',
        meterUrl: photos.meterUrl || 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400&q=80',
      },
      helmetCount: Number(helmetCount),
      accessoriesGiven,
      customerSignatureConfirmed: Boolean(customerSignatureConfirmed),
      customerSignatureName: customerSignatureName || session.name,
      vendorAgentName: vendorAgentName || session.name,
      remarks,
    });

    return NextResponse.json({
      success: true,
      report,
      message: `Digital ${handoverType} inspection recorded successfully.`,
    });
  } catch (error: any) {
    console.error('[API Handover POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit inspection report' }, { status: 500 });
  }
}
