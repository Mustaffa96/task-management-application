/**
 * Get Tasks Use Case
 * Handles the business logic for retrieving tasks with filtering options
 */
import { ITask, TaskPriority, TaskStatus } from '../../entities/task.entity';
import { ITaskRepository } from '../../interfaces/task-repository.interface';

/**
 * Get tasks use case input data
 */
export interface GetTasksInput {
  userId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  createdBy?: string;
  dueBefore?: Date;
  dueAfter?: Date;
}

/**
 * Get tasks use case output data
 */
export interface GetTasksOutput {
  tasks: ITask[];
}

/**
 * Get tasks use case
 * Handles the business logic for retrieving tasks with filtering options
 */
export class GetTasksUseCase {
  /**
   * Constructor
   * @param taskRepository Task repository instance
   */
  constructor(private taskRepository: ITaskRepository) {}

  /**
   * Execute the use case
   * @param input Get tasks input data
   * @returns Promise resolving to get tasks output
   */
  async execute(input: GetTasksInput): Promise<GetTasksOutput> {
    try {
      let tasks: ITask[];

      // If no filters are provided, get all tasks
      if (Object.keys(input).length === 0) {
        tasks = await this.taskRepository.findAll();
      } 
      // If userId is provided, get tasks created by or assigned to the user
      else if (input.userId && !input.assigneeId && !input.createdBy) {
        // Get tasks created by the user
        const createdTasks = await this.taskRepository.findByCreator(input.userId);
        
        // Get tasks assigned to the user
        const assignedTasks = await this.taskRepository.findByAssignee(input.userId);
        
        // Combine and remove duplicates
        const taskMap = new Map<string, ITask>();
        
        [...createdTasks, ...assignedTasks].forEach(task => {
          if (task.id) {
            taskMap.set(task.id, task);
          }
        });
        
        tasks = Array.from(taskMap.values());
      } 
      // Use advanced filtering
      else {
        tasks = await this.taskRepository.findWithFilters({
          status: input.status,
          priority: input.priority,
          assigneeId: input.assigneeId,
          createdBy: input.createdBy,
          dueBefore: input.dueBefore,
          dueAfter: input.dueAfter,
        });
      }

      // Return output
      return {
        tasks,
      };
    } catch (error) {
      // Re-throw errors
      throw error;
    }
  }
}
