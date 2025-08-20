/**
 * Task repository interface
 * Extends the generic repository with task-specific operations
 */
import { IRepository } from './repository.interface';
import { ITask, TaskStatus, TaskPriority } from '../entities/task.entity';

export interface ITaskRepository extends IRepository<ITask> {
  /**
   * Find tasks by creator ID
   * @param userId ID of the user who created the tasks
   * @returns Promise resolving to an array of tasks
   */
  findByCreator(userId: string): Promise<ITask[]>;
  
  /**
   * Find tasks assigned to a specific user
   * @param userId ID of the assigned user
   * @returns Promise resolving to an array of tasks
   */
  findByAssignee(userId: string): Promise<ITask[]>;
  
  /**
   * Find tasks by status
   * @param status Task status to filter by
   * @returns Promise resolving to an array of tasks
   */
  findByStatus(status: TaskStatus): Promise<ITask[]>;
  
  /**
   * Find tasks by priority
   * @param priority Task priority to filter by
   * @returns Promise resolving to an array of tasks
   */
  findByPriority(priority: TaskPriority): Promise<ITask[]>;
  
  /**
   * Find tasks due before a specific date
   * @param date Date to compare against
   * @returns Promise resolving to an array of tasks
   */
  findByDueDateBefore(date: Date): Promise<ITask[]>;
  
  /**
   * Find tasks with advanced filtering options
   * @param filter Object containing filter criteria
   * @returns Promise resolving to an array of tasks
   */
  findWithFilters(filter: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    createdBy?: string;
    dueBefore?: Date;
    dueAfter?: Date;
  }): Promise<ITask[]>;
}
