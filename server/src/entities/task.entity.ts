/**
 * Task entity definition
 * Represents the core task domain object with business rules
 */

/**
 * Task status enum
 * Defines possible statuses for a task
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
}

/**
 * Task priority enum
 * Defines possible priority levels for a task
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Task entity interface
 * Defines the structure and properties of a task
 */
export interface ITask {
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  assigneeId?: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Task entity class
 * Contains business logic and validation rules for tasks
 */
export class Task implements ITask {
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  assigneeId?: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;

  /**
   * Creates a new Task instance
   * @param taskData Task data to initialize the entity
   */
  constructor(taskData: ITask) {
    this.id = taskData.id;
    this.title = taskData.title;
    this.description = taskData.description;
    this.status = taskData.status || TaskStatus.TODO;
    this.priority = taskData.priority || TaskPriority.MEDIUM;
    this.dueDate = taskData.dueDate;
    this.assigneeId = taskData.assigneeId;
    this.createdBy = taskData.createdBy;
    this.createdAt = taskData.createdAt || new Date();
    this.updatedAt = taskData.updatedAt || new Date();
    
    this.validate();
  }

  /**
   * Validates task data according to business rules
   * @throws Error if validation fails
   */
  private validate(): void {
    if (!this.title || this.title.trim().length < 3) {
      throw new Error('Title must be at least 3 characters long');
    }

    if (!this.description) {
      throw new Error('Description is required');
    }

    if (!Object.values(TaskStatus).includes(this.status)) {
      throw new Error('Invalid task status');
    }

    if (!Object.values(TaskPriority).includes(this.priority)) {
      throw new Error('Invalid task priority');
    }

    if (!this.createdBy) {
      throw new Error('Creator ID is required');
    }
  }

  /**
   * Updates the task status
   * @param newStatus New status to set
   */
  updateStatus(newStatus: TaskStatus): void {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  /**
   * Assigns the task to a user
   * @param userId ID of the user to assign the task to
   */
  assignTo(userId: string): void {
    this.assigneeId = userId;
    this.updatedAt = new Date();
  }

  /**
   * Updates the task priority
   * @param newPriority New priority to set
   */
  updatePriority(newPriority: TaskPriority): void {
    this.priority = newPriority;
    this.updatedAt = new Date();
  }
}
