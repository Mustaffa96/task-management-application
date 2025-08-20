/**
 * Register User Use Case
 * Handles the business logic for user registration
 */
import { IUser, User, UserRole } from '../../entities/user.entity';
import { IUserRepository } from '../../interfaces/user-repository.interface';

/**
 * Register user use case input data
 */
export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * Register user use case output data
 */
export interface RegisterUserOutput {
  user: IUser;
}

/**
 * Register user use case
 * Handles the business logic for registering a new user
 */
export class RegisterUserUseCase {
  /**
   * Constructor
   * @param userRepository User repository instance
   */
  constructor(private userRepository: IUserRepository) {}

  /**
   * Execute the use case
   * @param input Register user input data
   * @returns Promise resolving to register user output
   * @throws Error if email already exists or validation fails
   */
  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // Check if email already exists
    const emailExists = await this.userRepository.emailExists(input.email);
    if (emailExists) {
      throw new Error('Email already in use');
    }

    try {
      // Create user entity to validate input
      const user = new User({
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role || UserRole.USER,
      });

      // Save user to database
      const createdUser = await this.userRepository.create(user);

      // Return output without password
      return {
        user: {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          role: createdUser.role,
          createdAt: createdUser.createdAt,
          updatedAt: createdUser.updatedAt,
        } as IUser,
      };
    } catch (error) {
      // Re-throw validation errors
      throw error;
    }
  }
}
