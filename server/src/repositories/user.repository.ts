/**
 * User repository implementation
 * Implements the IUserRepository interface using MongoDB
 */
import { IUserRepository } from '../interfaces/user-repository.interface';
import { IUser, User } from '../entities/user.entity';
import UserModel, { IUserDocument } from '../models/user.model';

/**
 * MongoDB implementation of the User repository
 * Handles data access operations for User entities
 */
export class UserRepository implements IUserRepository {
  /**
   * Create a new user
   * @param userData User data to create
   * @returns Promise resolving to the created user
   */
  async create(userData: IUser): Promise<IUser> {
    // Create a User entity to validate the data
    // This validates the data through User entity constructor
    new User(userData);
    
    // Create a new user document in MongoDB
    const createdUser = await UserModel.create(userData);
    
    return this.mapToEntity(createdUser);
  }

  /**
   * Find a user by ID
   * @param id User ID to find
   * @returns Promise resolving to the found user or null if not found
   */
  async findById(id: string): Promise<IUser | null> {
    const user = await UserModel.findById(id);
    return user ? this.mapToEntity(user) : null;
  }

  /**
   * Find all users matching the filter criteria
   * @param filter Filter criteria
   * @returns Promise resolving to an array of users
   */
  async findAll(filter: object = {}): Promise<IUser[]> {
    const users = await UserModel.find(filter);
    return users.map(user => this.mapToEntity(user));
  }

  /**
   * Update a user by ID
   * @param id User ID to update
   * @param userData Updated user data
   * @returns Promise resolving to the updated user or null if not found
   */
  async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: userData },
      { new: true, runValidators: true }
    );
    
    return updatedUser ? this.mapToEntity(updatedUser) : null;
  }

  /**
   * Delete a user by ID
   * @param id User ID to delete
   * @returns Promise resolving to true if deleted, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Find a user by email
   * @param email Email to search for
   * @returns Promise resolving to the found user or null if not found
   */
  async findByEmail(email: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    return user ? this.mapToEntity(user) : null;
  }

  /**
   * Check if a user with the given email exists
   * @param email Email to check
   * @returns Promise resolving to true if user exists, false otherwise
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }

  /**
   * Map a MongoDB document to a User entity
   * @param userDoc User document from MongoDB
   * @returns User entity
   */
  private mapToEntity(userDoc: IUserDocument): IUser {
    const userData = userDoc.toJSON();
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      password: userDoc.password, // Note: This is only used internally and never exposed
      role: userData.role,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    };
  }
}
