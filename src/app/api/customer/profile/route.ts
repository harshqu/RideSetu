import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/models/User';
import { KYCVerification } from '@/models/KYCVerification';
import { AuditLog } from '@/models/AuditLog';
import { getSessionFromRequest } from '@/lib/auth';
import { maskEmail, maskPhone } from '@/lib/encryption';

export async function GET(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).lean();
    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const hasName = Boolean(user.name && user.name.trim());
    const hasVerifiedEmail = Boolean(user.email && user.emailVerified);
    const hasVerifiedPhone = Boolean(user.phone && user.phoneVerified);
    const hasEmergencyContact = Boolean(
      user.emergencyContact && user.emergencyContact.name && user.emergencyContact.phone
    );

    let completionScore = 0;
    if (hasName) completionScore += 25;
    if (hasVerifiedEmail) completionScore += 25;
    if (hasVerifiedPhone) completionScore += 25;
    if (hasEmergencyContact) completionScore += 25;

    const isGoogleAccount = Array.isArray(user.authProviders) && user.authProviders.includes('GOOGLE');

    const safeProfile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      maskedEmail: maskEmail(user.email),
      maskedPhone: maskPhone(user.phone),
      role: user.role,
      avatar: user.avatar || '',
      kycStatus: user.kycStatus || 'NOT_STARTED',
      drivingLicenseStatus: user.drivingLicenseStatus || 'NOT_STARTED',
      emailVerified: Boolean(user.emailVerified),
      phoneVerified: Boolean(user.phoneVerified),
      isGoogleAccount,
      googleEmail: user.googleEmail || '',
      dateOfBirth: user.dateOfBirth || null,
      emergencyContact: user.emergencyContact || { name: '', phone: '', relation: '' },
      profileCompletionPercentage: completionScore,
      createdAt: user.createdAt,
    };

    return NextResponse.json({ profile: safeProfile });
  } catch (error: any) {
    console.error('[API Customer Profile GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { name, avatar, dateOfBirth, emergencyContact, email, phone } = body;

    await connectToDatabase();
    const uObjectId = new mongoose.Types.ObjectId(session.userId);
    const user = await User.findById(uObjectId);
    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const updateFields: Record<string, any> = {};
    const auditChanges: Record<string, any> = {};
    let kycInvalidated = false;

    if (name && name.trim() && name.trim() !== user.name) {
      auditChanges.oldName = user.name;
      auditChanges.newName = name.trim();
      updateFields.name = name.trim();
      if (user.kycStatus === 'VERIFIED') {
        kycInvalidated = true;
      }
    }

    if (avatar !== undefined) {
      updateFields.avatar = String(avatar).trim();
    }

    if (dateOfBirth) {
      const dobDate = new Date(dateOfBirth);
      if (!isNaN(dobDate.getTime())) {
        if (!user.dateOfBirth || dobDate.toISOString() !== new Date(user.dateOfBirth).toISOString()) {
          updateFields.dateOfBirth = dobDate;
          auditChanges.newDob = dobDate.toISOString();
          if (user.kycStatus === 'VERIFIED') {
            kycInvalidated = true;
          }
        }
      }
    }

    if (emergencyContact && typeof emergencyContact === 'object') {
      const cleanContact = {
        name: String(emergencyContact.name || '').trim(),
        phone: String(emergencyContact.phone || '').trim(),
        relation: String(emergencyContact.relation || '').trim(),
      };
      updateFields.emergencyContact = cleanContact;
      auditChanges.emergencyContactUpdated = true;
    }

    // Email change requires re-verification
    if (email && email.trim().toLowerCase() !== user.email) {
      const cleanEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: cleanEmail, _id: { $ne: uObjectId } });
      if (existingUser) {
        return NextResponse.json({ error: 'This email address is already in use by another account.' }, { status: 400 });
      }
      updateFields.email = cleanEmail;
      updateFields.emailVerified = false;
      auditChanges.emailChanged = true;
    }

    // Phone change requires re-verification
    if (phone && phone.trim() !== user.phone) {
      const cleanPhone = phone.trim();
      updateFields.phone = cleanPhone;
      updateFields.phoneVerified = false;
      auditChanges.phoneChanged = true;
    }

    if (kycInvalidated) {
      updateFields.kycStatus = 'ACTION_REQUIRED';
      updateFields.drivingLicenseStatus = 'ACTION_REQUIRED';
      auditChanges.kycStatusTransition = 'ACTION_REQUIRED (Identity attribute altered)';

      await KYCVerification.updateMany(
        { userId: uObjectId, status: 'VERIFIED' },
        {
          $set: {
            status: 'ACTION_REQUIRED',
            reverificationRequired: true,
            rejectionReason: 'Identity attributes were updated in profile. Please review and re-submit your KYC.',
          },
        }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(uObjectId, { $set: updateFields }, { new: true }).lean();

    await AuditLog.create({
      action: 'CUSTOMER_PROFILE_UPDATED',
      userId: uObjectId,
      userRole: session.role,
      resourceType: 'USER_PROFILE',
      resourceId: session.userId,
      details: auditChanges,
    });

    const hasName = Boolean(updatedUser?.name && updatedUser.name.trim());
    const hasVerifiedEmail = Boolean(updatedUser?.email && updatedUser.emailVerified);
    const hasVerifiedPhone = Boolean(updatedUser?.phone && updatedUser.phoneVerified);
    const hasEmergencyContact = Boolean(
      updatedUser?.emergencyContact && updatedUser.emergencyContact.name && updatedUser.emergencyContact.phone
    );

    let completionScore = 0;
    if (hasName) completionScore += 25;
    if (hasVerifiedEmail) completionScore += 25;
    if (hasVerifiedPhone) completionScore += 25;
    if (hasEmergencyContact) completionScore += 25;

    return NextResponse.json({
      success: true,
      message: kycInvalidated
        ? 'Profile updated. Because your legal identity information changed, please re-verify your KYC.'
        : 'Profile updated successfully.',
      profile: {
        _id: updatedUser?._id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        phone: updatedUser?.phone,
        maskedEmail: maskEmail(updatedUser?.email || ''),
        maskedPhone: maskPhone(updatedUser?.phone || ''),
        kycStatus: updatedUser?.kycStatus,
        emailVerified: updatedUser?.emailVerified,
        phoneVerified: updatedUser?.phoneVerified,
        emergencyContact: updatedUser?.emergencyContact,
        dateOfBirth: updatedUser?.dateOfBirth,
        profileCompletionPercentage: completionScore,
      },
    });
  } catch (error: any) {
    console.error('[API Customer Profile PATCH Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
