/**
 * User entity definition
 * Represents the core user domain object with business rules
 */

/**
 * User entity interface
 * Defines the structure and properties of a user
 */
export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User role enum
 * Defines possible user roles in the system
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

/**
 * User entity class
 * Contains business logic and validation rules for users
 */
export class User implements IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;

  /**
   * Creates a new User instance
   * @param userData User data to initialize the entity
   */
  constructor(userData: IUser) {
    this.id = userData.id;
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.role = userData.role || UserRole.USER;
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
    
    this.validate();
  }

  /**
   * Validates user data according to business rules
   * @throws Error if validation fails
   */
  private validate(): void {
    if (!this.name || this.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error('Valid email is required');
    }

    if (!this.password || this.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  }

  /**
   * Validates email format
   * @param email Email to validate
   * @returns True if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Returns a plain object representation of the user
   * Excludes sensitive information like password
   * @returns User data without sensitive fields
   */
  toJSON(): Partial<IUser> {
    // Use object destructuring but ignore password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
