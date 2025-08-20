/**
 * User model interface
 * Defines the structure of a user object
 */
export interface User {
  /**
   * User ID
   */
  id: string;
  
  /**
   * User's name
   */
  name: string;
  
  /**
   * User's email address
   */
  email: string;
  
  /**
   * User's role (admin or user)
   */
  role: 'admin' | 'user';
  
  /**
   * JWT token for authentication
   */
  token?: string;
}
