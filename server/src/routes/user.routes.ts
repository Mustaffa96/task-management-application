/**
 * User routes
 * Defines API endpoints for user management
 */
import express from 'express';
import { UserRepository } from '../repositories/user.repository';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { UserRole } from '../entities/user.entity';

// Create router instance
const router: express.Router = express.Router();

// Create repository instance
const userRepository = new UserRepository();

// Apply authentication middleware to all user routes
router.use(authenticate);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', async (req: AuthRequest, res: express.Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    // Get all users from repository
    const users = await userRepository.findAll();
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    // Re-throw errors
    throw error;
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    const { id } = req.params;
    
    // Get user from repository
    const user = await userRepository.findById(id);
    
    // Check if user exists
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    // Re-throw errors
    throw error;
  }
});

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/profile/me', async (req: AuthRequest, res: express.Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    // Get user from repository
    const user = await userRepository.findById(req.user.id);
    
    // Check if user exists
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user
    });
  } catch (error) {
    // Re-throw errors
    throw error;
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    const { id } = req.params;
    const { name, email } = req.body;
    
    // Check if user has permission to update
    if (id !== req.user.id && req.user.role !== UserRole.ADMIN) {
      throw new AppError('You do not have permission to update this user', 403);
    }
    
    // Get user from repository
    const existingUser = await userRepository.findById(id);
    
    // Check if user exists
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }
    
    // Check if email is already in use by another user
    if (email && email !== existingUser.email) {
      const emailExists = await userRepository.emailExists(email);
      if (emailExists) {
        throw new AppError('Email already in use', 400);
      }
    }
    
    // Update user properties
    if (name) existingUser.name = name;
    if (email) existingUser.email = email;
    
    // Save updated user
    const updatedUser = await userRepository.update(id, existingUser);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    // Re-throw errors
    throw error;
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authorize([UserRole.ADMIN]), async (req: AuthRequest, res: express.Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    const { id } = req.params;
    
    // Get user from repository
    const existingUser = await userRepository.findById(id);
    
    // Check if user exists
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }
    
    // Delete user
    const success = await userRepository.delete(id);
    
    if (!success) {
      throw new AppError('Failed to delete user', 500);
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    // Re-throw errors
    throw error;
  }
});

export default router;
