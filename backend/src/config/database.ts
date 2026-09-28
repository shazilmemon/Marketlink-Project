import mongoose from 'mongoose';
import { env } from './env';

export let isDbConnected = false;

export const connectDatabase = async (): Promise<typeof mongoose | null> => {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    isDbConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);

    mongoose.connection.on('disconnected', () => {
      isDbConnected = false;
      console.warn('⚠️ MongoDB disconnected.');
    });

    mongoose.connection.on('reconnected', () => {
      isDbConnected = true;
      console.log('🔄 MongoDB reconnected.');
    });

    return conn;
  } catch (error) {
    isDbConnected = false;
    console.warn(`⚠️ Database connection attempt warning: ${(error as Error).message}`);
    console.warn('Backend running with graceful fallback state mode.');
    return null;
  }
};

export const getDbStatus = (): string => {
  if (isDbConnected && mongoose.connection.readyState === 1) {
    return 'connected';
  }
  return 'disconnected';
};
