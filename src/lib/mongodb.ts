import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    try {
      const conn = await mongoose.connect(uri, {
        dbName: 'ridesetu',
        serverSelectionTimeoutMS: 20000,
        connectTimeoutMS: 20000,
        family: 4,
      });
      cached.conn = conn;
      return cached.conn;
    } catch (err: any) {
      cached.conn = null;
      if (attempt >= maxRetries) {
        const safeReason = err instanceof Error ? err.name + ': ' + err.message.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@') : 'Database connection error';
        console.error('[MongoDB] Connection error:', safeReason);
        throw err;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  throw new Error('Could not connect to MongoDB Atlas');
}

export default connectToDatabase;
