/**
 * Authentication controller
 * Handles HTTP requests related to authentication
 */
import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { RegisterUserUseCase } from '../use-cases/auth/register-user.use-case';
import { LoginUserUseCase } from '../use-cases/auth/login-user.use-case';
import { AppError } from '../middleware/error.middleware';
import { generateToken, verifyToken } from '../utils/jwt.utils';
// config import removed as it's not used directly

/**
 * Authentication controller class
 * Implements controller methods for auth routes
 */
export class AuthController {
  private userRepository: UserRepository;
  
  /**
   * Constructor
   */
  constructor() {
    this.userRepository = new UserRepository();
  }
  
  /**
   * Register a new user
   * @param req Express request object
   * @param res Express response object
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;
      
      // Create use case instance
      const registerUserUseCase = new RegisterUserUseCase(this.userRepository);
      
      // Execute use case
      const result = await registerUserUseCase.execute({
        name,
        email,
        password
      });
      
      // Return success response
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result.user
      });
    } catch (error: unknown) {
      // Handle specific errors
      if (error instanceof Error && error.message === 'Email already in use') {
        throw new AppError('Email already in use', 400);
      }
      
      // Re-throw other errors
      throw error;
    }
  };
  
  /**
   * Login a user
   * @param req Express request object
   * @param res Express response object
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      
      // Create use case instance
      const loginUserUseCase = new LoginUserUseCase(this.userRepository);
      
      // Execute use case
      const result = await loginUserUseCase.execute({
        email,
        password
      });
      
      // Set token in HTTP-only cookie for better security
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
      });
      
      // Return success response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error: unknown) {
      // Handle specific errors
      if (error instanceof Error && error.message === 'Invalid email or password') {
        throw new AppError('Invalid email or password', 401);
      }
      
      // Re-throw other errors
      throw error;
    }
  };
  
  /**
   * Refresh JWT token
   * @param req Express request object
   * @param res Express response object
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new AppError('Authentication token missing', 401);
    }
    
    try {
      // Verify token
      const decoded = verifyToken(token);
      
      // Generate new token
      const payload = { 
        id: decoded.id, 
        email: decoded.email,
        role: decoded.role 
      };
      
      // Use our utility function to generate token
      const newToken = generateToken(payload);
      
      // Set new token in HTTP-only cookie
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
      });
      
      // Return success response
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken
        }
      });
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }
  };
  
  /**
   * Logout a user
   * @param req Express request object
   * @param res Express response object
   */
  logout = (req: Request, res: Response): void => {
    // Clear the token cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  };
}
