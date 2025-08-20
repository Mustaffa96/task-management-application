/**
 * Authentication related interfaces
 */

/**
 * Login request payload
 */
export interface LoginRequest {
  /**
   * User email
   */
  email: string;
  
  /**
   * User password
   */
  password: string;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  /**
   * User name
   */
  name: string;
  
  /**
   * User email
   */
  email: string;
  
  /**
   * User password
   */
  password: string;
}

/**
 * Authentication response from API
 */
export interface AuthResponse {
  /**
   * User ID
   */
  id: string;
  
  /**
   * User name
   */
  name: string;
  
  /**
   * User email
   */
  email: string;
  
  /**
   * User role
   */
  role: 'admin' | 'user';
  
  /**
   * JWT token (if returned directly instead of via cookies)
   */
  token?: string;
}
