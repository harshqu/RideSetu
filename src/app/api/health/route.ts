import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      return NextResponse.json(
        {
          status: 'degraded',
          environment: process.env.NODE_ENV || 'production',
          database: 'disconnected',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'ok',
        environment: 'sandbox',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        environment: 'sandbox',
        database: 'unavailable',
      },
      { status: 500 }
    );
  }
}
