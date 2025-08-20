/**
 * JWT utility functions
 * Provides helper functions for JWT operations
 */
import jwt from 'jsonwebtoken';
import config from '../config/config';

/**
 * Interface for JWT payload
 */
interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Generate a JWT token
 * @param payload - The payload to include in the token
 * @returns The generated JWT token
 */
export const generateToken = (payload: JwtPayload): string => {
  // Define proper options type for jwt.sign
  const options: jwt.SignOptions = { 
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn']
  };
  
  // Return signed token with proper typing
  return jwt.sign(payload, config.jwt.secret, options);
};

/**
 * Verify a JWT token
 * @param token - The token to verify
 * @returns The decoded payload
 * @throws JsonWebTokenError if token is invalid
 * @throws TokenExpiredError if token is expired
 * @throws NotBeforeError if token is used before its nbf claim
 */
export const verifyToken = (token: string): JwtPayload => {
  // Use proper type assertion for the verified token
  const decoded = jwt.verify(token, config.jwt.secret);
  
  // Validate that the decoded token has the expected structure
  if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
    return decoded as JwtPayload;
  }
  
  // If token doesn't have the expected structure, throw an error
  throw new Error('Invalid token structure');
};
