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
   * 
   * @swagger
   * components:
   *   schemas:
   *     LoginRequest:
   *       type: object
   *       required:
   *         - email
   *         - password
   *       properties:
   *         email:
   *           type: string
   *           format: email
   *           description: User's email address
   *           example: admin@example.com
   *         password:
   *           type: string
   *           format: password
   *           description: User's password
   *           example: password123
   *     LoginResponse:
   *       type: object
   *       properties:
   *         success:
   *           type: boolean
   *           example: true
   *         message:
   *           type: string
   *           example: Login successful
   *         data:
   *           type: object
   *           properties:
   *             user:
   *               $ref: '#/components/schemas/User'
   *             token:
   *               type: string
   *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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
        sameSite: 'lax' // Changed from 'strict' to 'lax' for better cross-origin experience
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
   * Refresh token endpoint
   * @route POST /api/auth/refresh
   * @access Public - but requires a valid refresh token
   */
  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Get token from cookie or authorization header
      let token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
      
      // Log for debugging
      console.log('Refresh token request received:', {
        hasCookieToken: !!req.cookies.token,
        hasAuthHeader: !!req.header('Authorization'),
        tokenLength: token ? token.length : 0
      });
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }
      
      // Verify token
      const decoded = verifyToken(token);
      
      // Get user from database to ensure they still exist
      const user = await this.userRepository.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Generate new token
      const payload = { 
        id: decoded.id, 
        email: decoded.email,
        role: decoded.role,
        name: user.name // Include name in the token payload
      };
      
      // Use our utility function to generate token
      const newToken = generateToken(payload);
      
      // Set new token in HTTP-only cookie
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax' // Changed from 'strict' to 'lax' for better cross-origin experience
      });
      
      // Log successful token refresh
      console.log('Token refreshed successfully for user:', user.email);
      
      // Return success response with user data and token
      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token: newToken
        }
      });
    } catch (error: any) {
      // Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        console.warn('Token expired during refresh attempt');
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        console.warn('Invalid token during refresh attempt:', error.message);
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      
      // Log the error for debugging
      console.error('Token refresh error:', error);
      
      // Return generic error
      return res.status(500).json({
        success: false,
        message: 'Failed to refresh token',
        error: error.message
      });
    }
  };
  
  /**
   * Logout a user
   * @param req Express request object
   * @param res Express response object
   * @returns Response object
   */
  logout = (req: Request, res: Response): Response => {
    // Log logout attempt
    console.log('User logout requested');
    
    // Clear the token cookie with same settings as when it was set
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), // Expire immediately
      sameSite: 'lax', // Match the setting used when setting the cookie
      path: '/' // Ensure the cookie path matches
    });
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  };
}
