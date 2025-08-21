/**
 * User seeder file
 * Creates sample users for testing and development purposes
 */

import bcrypt from 'bcryptjs';
import { User, UserRole, IUser } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

/**
 * Generate a hashed password for security
 * @param password Plain text password to hash
 * @returns Promise resolving to hashed password
 */
const hashPassword = async (password: string): Promise<string> => {
  // Using bcrypt to hash passwords with a salt factor of 10
  // Using Promise-based version for consistency with the model
  return new Promise<string>((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        reject(err);
        return;
      }
      
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(hash);
      });
    });
  });
};

/**
 * Sample user data for seeding
 * Includes admin and regular user accounts
 */
const userSeedData: Omit<IUser, 'password'>[] = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.USER,
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: UserRole.USER,
  },
  {
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.USER,
  },
];

/**
 * Seeds the database with sample users
 * @returns Array of created user objects
 */
export const seedUsers = async (): Promise<IUser[]> => {
  const userRepository = new UserRepository();
  const createdUsers: IUser[] = [];

  // Use a common password for all test users
  const defaultPassword = await hashPassword('password123');

  // Process each user in the seed data
  for (const userData of userSeedData) {
    try {
      // Check if user already exists to prevent duplicates
      const existingUser = await userRepository.findByEmail(userData.email);

      if (existingUser) {
        // Update existing user's password
        console.log(`Updating password for user ${userData.email}...`);
        if (existingUser.id) {
          const updatedUser = await userRepository.update(existingUser.id, {
            ...existingUser,
            password: defaultPassword
          });
          if (updatedUser) {
            createdUsers.push(updatedUser);
          }
        }
        continue;
      }

      // Create new user with the seed data
      // The repository will handle validation internally
      const userDataWithPassword: IUser = {
        ...userData,
        password: defaultPassword,
      };

      // Save user to database
      const savedUser = await userRepository.create(userDataWithPassword);
      createdUsers.push(savedUser);
      console.log(`Created user: ${savedUser.name} (${savedUser.email})`);
    } catch (error) {
      console.error(`Failed to create user ${userData.email}:`, error);
    }
  }

  return createdUsers;
};
