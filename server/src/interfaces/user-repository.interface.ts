/**
 * User repository interface
 * Extends the generic repository with user-specific operations
 */
import { IRepository } from './repository.interface';
import { IUser } from '../entities/user.entity';

export interface IUserRepository extends IRepository<IUser> {
  /**
   * Find a user by email
   * @param email Email to search for
   * @returns Promise resolving to the found user or null if not found
   */
  findByEmail(email: string): Promise<IUser | null>;
  
  /**
   * Check if a user with the given email exists
   * @param email Email to check
   * @returns Promise resolving to true if user exists, false otherwise
   */
  emailExists(email: string): Promise<boolean>;
}
