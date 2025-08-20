/**
 * Authentication middleware
 * Validates JWT tokens and adds user information to request object
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
// UserRepository imports removed as they're not used

/**
 * Extended Request interface with user property
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Authentication middleware
 * Verifies JWT token and adds user data to request object
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'Authentication token missing' });
      return;
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as {
        id: string;
        email: string;
        role: string;
      };
      
      // Add user data to request object
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      
      // Continue to next middleware or route handler
      next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Error is caught but not used, we return a standardized message
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Error is caught but not used, we return a standardized message
    res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Role-based authorization middleware
 * Checks if the authenticated user has the required role
 * @param roles Array of allowed roles
 * @returns Middleware function
 */
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    
    next();
  };
};

/**
 * Validate token middleware
 * Checks if a token is valid without requiring authentication
 * Useful for token refresh endpoints
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token required' });
      return;
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'Token missing' });
      return;
    }
    
    try {
      // Verify token without adding user to request
      jwt.verify(token, config.jwt.secret);
      
      // Token is valid
      next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Error is caught but not used, we return a standardized message
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Error is caught but not used, we return a standardized message
    res.status(500).json({ error: 'Token validation error' });
  }
};
