/**
 * Update Task Use Case
 * Handles the business logic for updating an existing task
 */
import { ITask, TaskPriority, TaskStatus } from '../../entities/task.entity';
import { ITaskRepository } from '../../interfaces/task-repository.interface';
import { IUserRepository } from '../../interfaces/user-repository.interface';

/**
 * Update task use case input data
 */
export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  assigneeId?: string;
  updatedBy: string; // ID of the user performing the update
}

/**
 * Update task use case output data
 */
export interface UpdateTaskOutput {
  task: ITask;
}

/**
 * Update task use case
 * Handles the business logic for updating an existing task
 */
export class UpdateTaskUseCase {
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
   * @param input Update task input data
   * @returns Promise resolving to update task output
   * @throws Error if task not found, validation fails, or user doesn't have permission
   */
  async execute(input: UpdateTaskInput): Promise<UpdateTaskOutput> {
    // Find the task to update
    const existingTask = await this.taskRepository.findById(input.id);
    if (!existingTask) {
      throw new Error('Task not found');
    }

    // Verify that the user performing the update exists
    const updater = await this.userRepository.findById(input.updatedBy);
    if (!updater) {
      throw new Error('User not found');
    }

    // Check if the user has permission to update the task
    // Only the creator or the assignee can update the task
    if (existingTask.createdBy !== input.updatedBy && 
        existingTask.assigneeId !== input.updatedBy && 
        updater.role !== 'admin') {
      throw new Error('You do not have permission to update this task');
    }

    // Verify assignee exists if provided
    if (input.assigneeId) {
      const assignee = await this.userRepository.findById(input.assigneeId);
      if (!assignee) {
        throw new Error('Assignee user not found');
      }
    }

    try {
      // Create update data object
      const updateData: Partial<ITask> = {};
      
      if (input.title !== undefined) {
        updateData.title = input.title;
      }
      
      if (input.description !== undefined) {
        updateData.description = input.description;
      }
      
      if (input.status !== undefined) {
        updateData.status = input.status;
      }
      
      if (input.priority !== undefined) {
        updateData.priority = input.priority;
      }
      
      if (input.dueDate !== undefined) {
        updateData.dueDate = input.dueDate;
      }
      
      if (input.assigneeId !== undefined) {
        updateData.assigneeId = input.assigneeId;
      }
      
      // Always update the updatedAt timestamp
      updateData.updatedAt = new Date();

      // Update the task in the database
      const updatedTask = await this.taskRepository.update(input.id, updateData);
      
      if (!updatedTask) {
        throw new Error('Failed to update task');
      }

      // Return output
      return {
        task: updatedTask,
      };
    } catch (error) {
      // Re-throw validation errors
      throw error;
    }
  }
}
