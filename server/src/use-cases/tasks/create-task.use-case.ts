/**
 * Create Task Use Case
 * Handles the business logic for creating a new task
 */
import { ITask, Task, TaskPriority, TaskStatus } from '../../entities/task.entity';
import { ITaskRepository } from '../../interfaces/task-repository.interface';
import { IUserRepository } from '../../interfaces/user-repository.interface';

/**
 * Create task use case input data
 */
export interface CreateTaskInput {
  title: string;
  description: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  assigneeId?: string;
  createdBy: string;
}

/**
 * Create task use case output data
 */
export interface CreateTaskOutput {
  task: ITask;
}

/**
 * Create task use case
 * Handles the business logic for creating a new task
 */
export class CreateTaskUseCase {
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
   * @param input Create task input data
   * @returns Promise resolving to create task output
   * @throws Error if validation fails or user doesn't exist
   */
  async execute(input: CreateTaskInput): Promise<CreateTaskOutput> {
    // Verify that creator exists
    const creator = await this.userRepository.findById(input.createdBy);
    if (!creator) {
      throw new Error('Creator user not found');
    }

    // Verify assignee exists if provided
    if (input.assigneeId) {
      const assignee = await this.userRepository.findById(input.assigneeId);
      if (!assignee) {
        throw new Error('Assignee user not found');
      }
    }

    try {
      // Create task entity to validate input
      const task = new Task({
        title: input.title,
        description: input.description,
        status: input.status || TaskStatus.TODO,
        priority: input.priority || TaskPriority.MEDIUM,
        dueDate: input.dueDate,
        assigneeId: input.assigneeId,
        createdBy: input.createdBy,
      });

      // Save task to database
      const createdTask = await this.taskRepository.create(task);

      // Return output
      return {
        task: createdTask,
      };
    } catch (error) {
      // Re-throw validation errors
      throw error;
    }
  }
}
