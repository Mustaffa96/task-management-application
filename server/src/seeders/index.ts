/**
 * Main seeder file that orchestrates the execution of all seeders
 * This file provides functions to seed the database with test data
 */

import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { seedUsers } from './user.seeder';
import { seedTasks } from './task.seeder';

/**
 * Seeds all data in the correct order (users first, then tasks)
 * Ensures proper relationships between entities
 */
export const seedAll = async (): Promise<void> => {
  try {
    // Connect to the database
    await connectDatabase();
    console.log('🌱 Starting database seeding...');
    
    // Seed users first since tasks depend on users
    console.log('🌱 Seeding users...');
    const users = await seedUsers();
    console.log(`✅ Successfully seeded ${users.length} users`);
    
    // Seed tasks after users are created
    console.log('🌱 Seeding tasks...');
    const tasks = await seedTasks(users);
    console.log(`✅ Successfully seeded ${tasks.length} tasks`);
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Always disconnect from the database when done
    await mongoose.connection.close();
  }
};

/**
 * Execute the seeder when this script is run directly
 */
if (require.main === module) {
  seedAll()
    .then(() => {
      console.log('🚀 Seeding process completed, exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error during seeding:', error);
      process.exit(1);
    });
}
