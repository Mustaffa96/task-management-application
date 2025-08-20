/**
 * Login User Use Case
 * Handles the business logic for user authentication
 */
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../interfaces/user-repository.interface';
import config from '../../config/config';
import UserModel from '../../models/user.model';

/**
 * Login user use case input data
 */
export interface LoginUserInput {
  email: string;
  password: string;
}

/**
 * Login user use case output data
 */
export interface LoginUserOutput {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

/**
 * Login user use case
 * Handles the business logic for authenticating a user
 */
export class LoginUserUseCase {
  /**
   * Constructor
   * @param userRepository User repository instance
   */
  constructor(private userRepository: IUserRepository) {}

  /**
   * Execute the use case
   * @param input Login user input data
   * @returns Promise resolving to login user output
   * @throws Error if authentication fails
   */
  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    // Find user by email
    const user = await this.userRepository.findByEmail(input.email);
    
    // Check if user exists
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // We need to use the Mongoose model to access the comparePassword method
    const userDoc = await UserModel.findById(user.id);
    
    if (!userDoc) {
      throw new Error('User not found');
    }
    
    // Verify password
    const isPasswordValid = await userDoc.comparePassword(input.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    // Return user data and token
    return {
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }
}
