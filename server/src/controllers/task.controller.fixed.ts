/**
 * Task controller
 * Handles HTTP requests related to tasks
 */
import { Response } from 'express';
import { TaskRepository } from '../repositories/task.repository';
import { UserRepository } from '../repositories/user.repository';
import { CreateTaskUseCase } from '../use-cases/tasks/create-task.use-case';
import { UpdateTaskUseCase } from '../use-cases/tasks/update-task.use-case';
import { GetTasksUseCase } from '../use-cases/tasks/get-tasks.use-case';
import { DeleteTaskUseCase } from '../use-cases/tasks/delete-task.use-case';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

/**
 * Task controller class
 * Implements controller methods for task routes
 */
export class TaskController {
  private taskRepository: TaskRepository;
  private userRepository: UserRepository;
  
  /**
   * Constructor
   */
  constructor() {
    this.taskRepository = new TaskRepository();
    this.userRepository = new UserRepository();
  }
  
  /**
   * Create a new task
   * @param req Express request object
   * @param res Express response object
   */
  createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    
    // Create use case instance
    const createTaskUseCase = new CreateTaskUseCase(
      this.taskRepository,
      this.userRepository
    );
    
    // Execute use case
    const result = await createTaskUseCase.execute({
      title,
      description,
      status: status || TaskStatus.TODO,
      priority: priority || TaskPriority.MEDIUM,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assigneeId,
      createdBy: req.user.id
    });
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: result.task
    });
  };
  
  /**
   * Get all tasks with optional filtering
   * @param req Express request object
   * @param res Express response object
   */
  getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    // Extract query parameters
    const { 
      status, 
      priority, 
      assigneeId, 
      createdBy,
      dueBefore,
      dueAfter,
      mine
    } = req.query;
    
    // Create use case instance
    const getTasksUseCase = new GetTasksUseCase(this.taskRepository);
    
    // Prepare input for use case
    interface TaskQueryInput {
      userId?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string;
      createdBy?: string;
      dueBefore?: Date;
      dueAfter?: Date;
    }
    
    const input: TaskQueryInput = {};
    
    // If 'mine' flag is true, get tasks created by or assigned to the current user
    if (mine === 'true') {
      input.userId = req.user.id;
    } else {
      // Otherwise, apply filters
      if (status) input.status = status as TaskStatus;
      if (priority) input.priority = priority as TaskPriority;
      if (assigneeId) input.assigneeId = assigneeId as string;
      if (createdBy) input.createdBy = createdBy as string;
      if (dueBefore) input.dueBefore = new Date(dueBefore as string);
      if (dueAfter) input.dueAfter = new Date(dueAfter as string);
    }
    
    // Execute use case
    const result = await getTasksUseCase.execute(input);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: result.tasks
    });
  };
  
  /**
   * Get a task by ID
   * @param req Express request object
   * @param res Express response object
   */
  getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    const { id } = req.params;
    
    // Get task from repository
    const task = await this.taskRepository.findById(id);
    
    // Check if task exists
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: task
    });
  };
  
  /**
   * Update a task
   * @param req Express request object
   * @param res Express response object
   */
  updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    const { id } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    
    try {
      // Create use case instance
      const updateTaskUseCase = new UpdateTaskUseCase(
        this.taskRepository,
        this.userRepository
      );
      
      // Execute use case
      const result = await updateTaskUseCase.execute({
        id,
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assigneeId,
        updatedBy: req.user.id
      });
      
      // Return success response
      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: result.task
      });
    } catch (error) {
      // Handle specific errors
      if (error instanceof Error) {
        if (error.message === 'Task not found') {
          throw new AppError('Task not found', 404);
        }
        
        if (error.message === 'You do not have permission to update this task') {
          throw new AppError('You do not have permission to update this task', 403);
        }
      }
      
      // Re-throw other errors
      throw error;
    }
  };
  
  /**
   * Delete a task
   * @param req Express request object
   * @param res Express response object
   */
  deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    // Ensure user is authenticated
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }
    
    const { id } = req.params;
    
    try {
      // Create use case instance
      const deleteTaskUseCase = new DeleteTaskUseCase(
        this.taskRepository,
        this.userRepository
      );
      
      // Execute use case
      const result = await deleteTaskUseCase.execute({
        id,
        userId: req.user.id
      });
      
      // Return success response
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: result
      });
    } catch (error) {
      // Handle specific errors
      if (error instanceof Error) {
        if (error.message === 'Task not found') {
          throw new AppError('Task not found', 404);
        }
        
        if (error.message === 'You do not have permission to delete this task') {
          throw new AppError('You do not have permission to delete this task', 403);
        }
      }
      
      // Re-throw other errors
      throw error;
    }
  };
}
