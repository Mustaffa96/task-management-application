/**
 * User MongoDB model
 * Implements the data persistence layer for User entities
 */
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole } from '../entities/user.entity';

/**
 * User document interface
 * Extends both Mongoose Document and User entity interface
 */
export interface IUserDocument extends Omit<IUser, 'id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User schema definition
 * Defines the MongoDB schema for users
 */
const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    toJSON: {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      transform: (_doc, ret) => {
        // Create a new object with all properties
        const record: Record<string, unknown> = {};
        
        // Copy all properties except _id, password and __v
        Object.keys(ret).forEach(key => {
          if (key !== '_id' && key !== '__v' && key !== 'password') {
            record[key] = (ret as Record<string, unknown>)[key];
          }
        });
        
        // Add id property based on _id
        if (ret._id) {
          record.id = ret._id.toString();
        }
        
        return record;
      },
    },
  }
);

/**
 * Password hashing middleware
 * Automatically hashes the password before saving
 */
UserSchema.pre<IUserDocument>('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt with rounds parameter
    // Using Promise-based version to avoid callback issues
    const salt = await new Promise<string>((resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) reject(err);
        else resolve(salt);
      });
    });
    
    // Hash the password using the salt
    // Using Promise-based version to avoid callback issues
    const hashedPassword = await new Promise<string>((resolve, reject) => {
      bcrypt.hash(this.password, salt, (err, hash) => {
        if (err) reject(err);
        else resolve(hash);
      });
    });
    
    // Assign the hashed password back to the document
    this.password = hashedPassword;
    next();
  } catch (error: unknown) {
    // Pass any errors to the next middleware
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

/**
 * Compare password method
 * Verifies if the provided password matches the stored hash
 * @param candidatePassword Password to compare
 * @returns True if password matches
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // Use Promise-based version to handle callback correctly
  return new Promise<boolean>((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) reject(err);
      else resolve(isMatch);
    });
  });
};

/**
 * Swagger documentation for User model
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated ID of the user
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         role:
 *           type: string
 *           enum: [admin, user]
 *           description: User's role
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the user was last updated
 */

// Create and export the User model
export default mongoose.model<IUserDocument>('User', UserSchema);
