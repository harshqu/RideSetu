import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();

    const notifications = await Notification.find({
      userId: new mongoose.Types.ObjectId(session.userId),
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(session.userId),
      read: false,
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('[API Notifications GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { notificationId, markAll } = await request.json();

    await connectToDatabase();

    if (markAll) {
      await Notification.updateMany(
        { userId: new mongoose.Types.ObjectId(session.userId), read: false },
        { $set: { read: true } }
      );
      return NextResponse.json({ success: true, message: 'All notifications marked as read.' });
    }

    if (notificationId) {
      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
      }

      await Notification.findOneAndUpdate(
        { _id: notificationId, userId: new mongoose.Types.ObjectId(session.userId) },
        { $set: { read: true } }
      );
      return NextResponse.json({ success: true, message: 'Notification marked as read.' });
    }

    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error: any) {
    console.error('[API Notifications PATCH Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update notifications' }, { status: 500 });
  }
}
