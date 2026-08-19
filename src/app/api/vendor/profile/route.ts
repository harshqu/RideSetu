import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { Vendor } from '@/models/Vendor';
import { User } from '@/models/User';
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

    let vendor = null;
    if (session.vendorId && mongoose.Types.ObjectId.isValid(session.vendorId)) {
      vendor = await Vendor.findById(session.vendorId).populate('destinationId', 'name slug');
    } else if (session.userId) {
      vendor = await Vendor.findOne({ userId: session.userId }).populate('destinationId', 'name slug');
    }

    if (!vendor) {
      return NextResponse.json({
        exists: false,
        profile: null,
        onboardingStatus: 'NOT_REGISTERED',
      });
    }

    return NextResponse.json({
      exists: true,
      profile: vendor,
      onboardingStatus: vendor.verificationStatus,
    });
  } catch (error: any) {
    console.error('[API Vendor Profile GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch vendor profile' }, { status: 500 });
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

    const body = await req.json();
    const {
      businessName,
      ownerName,
      phone,
      email,
      address,
      city,
      state = 'Uttarakhand',
      pincode,
      businessType = 'PROPRIETORSHIP',
      gstNumber,
      rentalLicenseNumber,
      businessDescription,
      yearsInBusiness,
      operatingHours,
      pickupInstructions,
      deliveryRadiusKm,
      baseDeliveryFee,
      submitForReview = false,
    } = body;

    if (!businessName || !ownerName || !phone || !address || !city) {
      return NextResponse.json(
        { error: 'Business Name, Owner Name, Phone, Address, and City are required.' },
        { status: 400 }
      );
    }

    // Resolve or find destination by city
    let destination = await Destination.findOne({
      $or: [
        { name: new RegExp(`^${city.trim()}$`, 'i') },
        { slug: city.trim().toLowerCase() },
      ],
    });

    if (!destination) {
      // Fallback destination if new city
      destination = await Destination.findOne();
    }

    let vendor = await Vendor.findOne({ userId: session.userId });

    const newStatus = submitForReview
      ? 'UNDER_REVIEW'
      : vendor?.verificationStatus || 'PENDING';

    if (vendor) {
      vendor.businessName = businessName;
      vendor.ownerName = ownerName;
      vendor.phone = phone;
      vendor.email = email || vendor.email;
      vendor.address = address;
      vendor.city = city;
      vendor.state = state;
      vendor.pincode = pincode || vendor.pincode;
      vendor.businessType = businessType;
      vendor.gstNumber = gstNumber || '';
      vendor.rentalLicenseNumber = rentalLicenseNumber || vendor.rentalLicenseNumber;
      vendor.businessDescription = businessDescription || vendor.businessDescription;
      vendor.yearsInBusiness = yearsInBusiness !== undefined ? Number(yearsInBusiness) : vendor.yearsInBusiness;
      if (operatingHours) vendor.operatingHours = operatingHours;
      if (pickupInstructions) vendor.pickupInstructions = pickupInstructions;
      if (deliveryRadiusKm !== undefined) vendor.deliveryRadiusKm = Number(deliveryRadiusKm);
      if (baseDeliveryFee !== undefined) vendor.baseDeliveryFee = Number(baseDeliveryFee);
      if (destination) vendor.destinationId = destination._id;
      if (submitForReview && vendor.verificationStatus !== 'VERIFIED') {
        vendor.verificationStatus = 'UNDER_REVIEW';
      }

      await vendor.save();
    } else {
      vendor = await Vendor.create({
        userId: new mongoose.Types.ObjectId(session.userId),
        businessName,
        ownerName,
        phone,
        email: email || session.email,
        address,
        city,
        state,
        pincode: pincode || '',
        destinationId: destination?._id,
        businessType,
        gstNumber: gstNumber || '',
        rentalLicenseNumber: rentalLicenseNumber || 'PENDING_REGISTRATION',
        businessDescription: businessDescription || '',
        yearsInBusiness: yearsInBusiness ? Number(yearsInBusiness) : 1,
        operatingHours: operatingHours || { open: '08:00 AM', close: '09:00 PM', days: 'Mon - Sun' },
        pickupInstructions: pickupInstructions || '',
        deliveryRadiusKm: deliveryRadiusKm ? Number(deliveryRadiusKm) : 15,
        baseDeliveryFee: baseDeliveryFee ? Number(baseDeliveryFee) : 100,
        verificationStatus: newStatus,
      });

      // Update User profile with vendorId
      await User.findByIdAndUpdate(session.userId, { vendorId: vendor._id, role: 'VENDOR' });
    }

    return NextResponse.json({
      success: true,
      profile: vendor,
      message: submitForReview
        ? 'Business profile and onboarding application submitted for RideSetu Admin Review.'
        : 'Business profile updated successfully.',
    });
  } catch (error: any) {
    console.error('[API Vendor Profile POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to save vendor profile' }, { status: 500 });
  }
}
