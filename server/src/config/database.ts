/**
 * Database connection module
 * Handles MongoDB connection using Mongoose
 */
import mongoose from 'mongoose';
import config from './config';
import { logger } from '../utils/logger';

/**
 * Connect to MongoDB database
 * @returns Promise that resolves when connection is established
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    // Connect to MongoDB using the URI from config
    await mongoose.connect(config.db.uri);
    
    logger.info('MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default { connectDatabase };
