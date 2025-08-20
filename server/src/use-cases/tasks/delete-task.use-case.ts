/**
 * Delete Task Use Case
 * Handles the business logic for deleting an existing task
 */
import { ITaskRepository } from '../../interfaces/task-repository.interface';
import { IUserRepository } from '../../interfaces/user-repository.interface';

/**
 * Delete task use case input data
 */
export interface DeleteTaskInput {
  id: string;
  userId: string; // ID of the user performing the delete
}

/**
 * Delete task use case output data
 */
export interface DeleteTaskOutput {
  success: boolean;
}

/**
 * Delete task use case
 * Handles the business logic for deleting an existing task
 */
export class DeleteTaskUseCase {
  /**
   * Constructor
   * @param taskRepository Task repository instance
   * @param userRepository User repository instance
   */
  constructor(
    private taskRepository: ITaskRepository,
    private userRepository: IUserRepository
  ) {}

  /**
   * Execute the use case
   * @param input Delete task input data
   * @returns Promise resolving to delete task output
   * @throws Error if task not found or user doesn't have permission
   */
  async execute(input: DeleteTaskInput): Promise<DeleteTaskOutput> {
    // Find the task to delete
    const existingTask = await this.taskRepository.findById(input.id);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    // Verify that the user performing the delete exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if the user has permission to delete the task
    // Only the creator or an admin can delete the task
    if (existingTask.createdBy !== input.userId && user.role !== 'admin') {
      throw new Error('You do not have permission to delete this task');
    }

    try {
      // Delete the task from the database
      const success = await this.taskRepository.delete(input.id);
      
      if (!success) {
        throw new Error('Failed to delete task');
      }

      // Return output
      return {
        success,
      };
    } catch (error) {
      // Re-throw errors
      throw error;
    }
  }
}
