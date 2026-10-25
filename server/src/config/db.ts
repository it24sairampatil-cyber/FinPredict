// FinPredict.js - MongoDB Connection Manager via Mongoose
import mongoose from 'mongoose';

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finpredict_db';

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    console.log(`🍃 [MongoDB] Successfully connected to database: ${mongoose.connection.name}`);
  } catch (error) {
    console.warn(`⚠️ [MongoDB] Connection to ${uri} failed:`, error instanceof Error ? error.message : error);
    console.warn('⚠️ [MongoDB] Operating in offline mode. Local clients can fallback to browser IndexedDB.');
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('🍃 [MongoDB] Disconnected from database.');
});
