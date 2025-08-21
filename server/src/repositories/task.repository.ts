/**
 * Task repository implementation
 * Implements the ITaskRepository interface using MongoDB
 */
import { ITaskRepository } from '../interfaces/task-repository.interface';
import { ITask, Task, TaskStatus, TaskPriority } from '../entities/task.entity';
import TaskModel, { ITaskDocument } from '../models/task.model';

/**
 * MongoDB implementation of the Task repository
 * Handles data access operations for Task entities
 */
export class TaskRepository implements ITaskRepository {
  /**
   * Create a new task
   * @param taskData Task data to create
   * @returns Promise resolving to the created task
   */
  async create(taskData: ITask): Promise<ITask> {
    // Create a Task entity to validate the data
    // This validates the data through Task entity constructor
    new Task(taskData);
    
    // Create a new task document in MongoDB
    const createdTask = await TaskModel.create(taskData);
    
    return this.mapToEntity(createdTask);
  }

  /**
   * Find a task by ID
   * @param id Task ID to find
   * @returns Promise resolving to the found task or null if not found
   */
  async findById(id: string): Promise<ITask | null> {
    const task = await TaskModel.findById(id);
    return task ? this.mapToEntity(task) : null;
  }

  /**
   * Find all tasks matching the filter criteria
   * @param filter Filter criteria
   * @returns Promise resolving to an array of tasks
   */
  async findAll(filter: object = {}): Promise<ITask[]> {
    const tasks = await TaskModel.find(filter);
    return tasks.map(task => this.mapToEntity(task));
  }

  /**
   * Update a task by ID
   * @param id Task ID to update
   * @param taskData Updated task data
   * @returns Promise resolving to the updated task or null if not found
   */
  async update(id: string, taskData: Partial<ITask>): Promise<ITask | null> {
    const updatedTask = await TaskModel.findByIdAndUpdate(
      id,
      { $set: taskData },
      { new: true, runValidators: true }
    );
    
    return updatedTask ? this.mapToEntity(updatedTask) : null;
  }

  /**
   * Delete a task by ID
   * @param id Task ID to delete
   * @returns Promise resolving to true if deleted, false otherwise
   */
  async delete(id: string): Promise<boolean> {
    const result = await TaskModel.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Find tasks by creator ID
   * @param userId ID of the user who created the tasks
   * @returns Promise resolving to an array of tasks
   */
  async findByCreator(userId: string): Promise<ITask[]> {
    const tasks = await TaskModel.find({ createdBy: userId });
    return tasks.map(task => this.mapToEntity(task));
  }

  /**
   * Find tasks assigned to a specific user
   * @param userId ID of the assigned user
   * @returns Promise resolving to an array of tasks
   */
  async findByAssignee(userId: string): Promise<ITask[]> {
    const tasks = await TaskModel.find({ assignedTo: userId });
    return tasks.map(task => this.mapToEntity(task));
  }

  /**
   * Find tasks by status
   * @param status Task status to filter by
   * @returns Promise resolving to an array of tasks
   */
  async findByStatus(status: TaskStatus): Promise<ITask[]> {
    const tasks = await TaskModel.find({ status });
    return tasks.map(task => this.mapToEntity(task));
  }

  /**
   * Find tasks by priority
   * @param priority Task priority to filter by
   * @returns Promise resolving to an array of tasks
   */
  async findByPriority(priority: TaskPriority): Promise<ITask[]> {
    const tasks = await TaskModel.find({ priority });
    return tasks.map(task => this.mapToEntity(task));
  }

  /**
   * Find tasks due before a specific date
   * @param date Date to compare against
   * @returns Promise resolving to an array of tasks
   */
  async findByDueDateBefore(date: Date): Promise<ITask[]> {
    const tasks = await TaskModel.find({ dueDate: { $lte: date } });
    return tasks.map(task => this.mapToEntity(task));
  }

  /**
   * Find tasks with advanced filtering options
   * @param filter Object containing filter criteria
   * @returns Promise resolving to an array of tasks
   */
  async findWithFilters(filter: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    createdBy?: string;
    dueBefore?: Date;
    dueAfter?: Date;
  }): Promise<ITask[]> {
    // Build the query object based on provided filters
    // Use Record<string, unknown> instead of any
    const query: Record<string, unknown> = {};
    
    if (filter.status) {
      query.status = filter.status;
    }
    
    if (filter.priority) {
      query.priority = filter.priority;
    }
    
    if (filter.assigneeId) {
      query.assignedTo = filter.assigneeId;
    }
    
    if (filter.createdBy) {
      query.createdBy = filter.createdBy;
    }
    
    // Handle date range queries
    if (filter.dueBefore || filter.dueAfter) {
      // Use type assertion for nested MongoDB query operators
      query.dueDate = {} as Record<string, Date>;
      
      if (filter.dueBefore) {
        (query.dueDate as Record<string, Date>).$lte = filter.dueBefore;
      }
      
      if (filter.dueAfter) {
        (query.dueDate as Record<string, Date>).$gte = filter.dueAfter;
      }
    }
    
    const tasks = await TaskModel.find(query as Record<string, unknown>);
    return tasks.map(task => this.mapToEntity(task));
  }

  /**
   * Find tasks created by or assigned to a user
   * @param userId ID of the user
   * @returns Promise resolving to an array of tasks
   */
  async findUserTasks(userId: string): Promise<ITask[]> {
    // Find tasks where the user is either the creator or the assignee
    const tasks = await TaskModel.find({
      $or: [
        { createdBy: userId },
        { assigneeId: userId }
      ]
    });
    
    return tasks.map(task => this.mapToEntity(task));
  }

  /**
   * Map a MongoDB document to a Task entity
   * @param taskDoc Task document from MongoDB
   * @returns Task entity
   */
  private mapToEntity(taskDoc: ITaskDocument): ITask {
    const taskData = taskDoc.toJSON();
    return {
      id: taskData.id,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      assigneeId: taskData.assigneeId,
      createdBy: taskData.createdBy,
      createdAt: taskData.createdAt,
      updatedAt: taskData.updatedAt
    };
  }
}
