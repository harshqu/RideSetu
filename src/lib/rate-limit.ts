import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

/**
 * Lightweight in-memory rate limiter for serverless/API routes
 */
export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions = { limit: 15, windowMs: 60 * 1000 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const now = Date.now();
  const clientRecord = rateLimitMap.get(ip);

  if (!clientRecord || now > clientRecord.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return {
      allowed: true,
      remaining: options.limit - 1,
      resetTime: now + options.windowMs,
    };
  }

  if (clientRecord.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: clientRecord.resetTime,
    };
  }

  clientRecord.count += 1;
  return {
    allowed: true,
    remaining: options.limit - clientRecord.count,
    resetTime: clientRecord.resetTime,
  };
}

export function rateLimitResponse(resetTime: number): NextResponse {
  const retryAfterSeconds = Math.ceil((resetTime - Date.now()) / 1000);
  return NextResponse.json(
    {
      success: false,
      error: 'Too many requests. Rate limit exceeded. Please try again later.',
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
      },
    }
  );
}
