/**
 * Debug script for testing login functionality
 * This script helps diagnose issues with the login process
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase } from './config/database';
import UserModel from './models/user.model';
import { logger } from './utils/logger';

/**
 * Main function to debug login issues
 */
async function debugLogin(): Promise<void> {
  try {
    // Connect to the database
    await connectDatabase();
    logger.info('Connected to database');

    // Find the admin user
    const email = 'admin@example.com';
    const password = 'password123';
    
    logger.info(`Looking for user with email: ${email}`);
    const user = await UserModel.findOne({ email });
    
    if (!user) {
      logger.error('User not found in database');
      return;
    }
    
    logger.info('User found in database:');
    logger.info(`ID: ${user._id}`);
    logger.info(`Name: ${user.name}`);
    logger.info(`Email: ${user.email}`);
    logger.info(`Role: ${user.role}`);
    
    // Test password comparison
    logger.info('Testing password comparison...');
    
    // Direct bcrypt comparison for debugging
    let directCompare = false;
    try {
      // Use Promise-based version to handle callback correctly
      directCompare = await new Promise<boolean>((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) reject(err);
          else resolve(isMatch);
        });
      });
    } catch (error) {
      logger.error('Error comparing passwords:', error);
    }
    logger.info(`Direct bcrypt comparison result: ${directCompare}`);
    
    // Using model method
    const modelCompare = await user.comparePassword(password);
    logger.info(`Model comparePassword result: ${modelCompare}`);
    
    if (!modelCompare) {
      logger.error('Password comparison failed');
      logger.info('This is why login is failing with "Invalid email or password"');
    } else {
      logger.info('Password comparison succeeded');
      logger.info('Login should work with these credentials');
    }
  } catch (error) {
    logger.error('Error during debugging:', error);
  } finally {
    // Disconnect from database
    await mongoose.connection.close();
    logger.info('Disconnected from database');
  }
}

// Run the debug function
debugLogin()
  .then(() => {
    logger.info('Debug process completed');
  })
  .catch((error) => {
    logger.error('Fatal error during debugging:', error);
  });
