/**
 * Task model interfaces
 * Defines the structure of task objects
 */

/**
 * Task priority enum
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Task status enum
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

/**
 * Task interface
 * Represents a task in the system
 */
export interface Task {
  /**
   * Task ID
   */
  id: string;
  
  /**
   * Task title
   */
  title: string;
  
  /**
   * Task description
   */
  description: string;
  
  /**
   * Task status
   */
  status: TaskStatus;
  
  /**
   * Task priority
   */
  priority: TaskPriority;
  
  /**
   * Due date for the task
   */
  dueDate?: Date;
  
  /**
   * User ID of the task creator
   */
  createdBy: string;
  
  /**
   * User ID of the task assignee
   */
  assignedTo?: string;
  
  /**
   * Creation timestamp
   */
  createdAt: Date;
  
  /**
   * Last update timestamp
   */
  updatedAt: Date;
}

/**
 * Task creation request payload
 */
export interface CreateTaskRequest {
  /**
   * Task title
   */
  title: string;
  
  /**
   * Task description
   */
  description: string;
  
  /**
   * Task status
   */
  status: TaskStatus;
  
  /**
   * Task priority
   */
  priority: TaskPriority;
  
  /**
   * Due date for the task
   */
  dueDate?: Date;
  
  /**
   * User ID of the task assignee
   */
  assignedTo?: string;
}

/**
 * Task update request payload
 */
export interface UpdateTaskRequest {
  /**
   * Task title
   */
  title?: string;
  
  /**
   * Task description
   */
  description?: string;
  
  /**
   * Task status
   */
  status?: TaskStatus;
  
  /**
   * Task priority
   */
  priority?: TaskPriority;
  
  /**
   * Due date for the task
   */
  dueDate?: Date | null;
  
  /**
   * User ID of the task assignee
   */
  assignedTo?: string | null;
}

/**
 * Task filter options
 */
export interface TaskFilter {
  /**
   * Filter by status
   */
  status?: TaskStatus;
  
  /**
   * Filter by priority
   */
  priority?: TaskPriority;
  
  /**
   * Filter by creator ID
   */
  createdBy?: string;
  
  /**
   * Filter by assignee ID
   */
  assignedTo?: string;
  
  /**
   * Filter by due date (start range)
   */
  dueDateFrom?: Date;
  
  /**
   * Filter by due date (end range)
   */
  dueDateTo?: Date;
}
