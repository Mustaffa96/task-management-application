/**
 * Error handling middleware
 * Provides centralized error handling for the application
 */
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Custom error class with status code
 */
export class AppError extends Error {
  statusCode: number;
  
  /**
   * Constructor
   * @param message Error message
   * @param statusCode HTTP status code
   */
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found error handler
 * Handles 404 errors for routes that don't exist
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Global error handler
 * Handles all errors in the application
 * @param err Error object
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging
  logger.error('Error:', err);
  
  // Set default status code and message
  const statusCode = (err as AppError).statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Determine if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      // Only include stack trace in development
      ...(isDevelopment && { stack: err.stack }),
    },
  });
};
