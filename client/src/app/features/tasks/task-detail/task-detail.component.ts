/**
 * Task Detail component
 * Displays detailed information about a specific task
 */
import { Component } from '@angular/core';
import type { OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { TaskStatus, TaskPriority } from '../../../core/models/task.model';
import type { Task } from '../../../core/models/task.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Interface for user reference in tasks
 */
interface UserReference {
  name?: string;
  email?: string;
  id?: string;
}

/**
 * Task Detail component
 * Displays detailed information about a specific task
 */
@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {
  /**
   * Task ID from route parameter
   */
  taskId = '';
  
  /**
   * Task data
   */
  task: Task | null = null;
  
  /**
   * Loading state
   */
  isLoading = false;
  
  /**
   * Error message
   */
  errorMessage: string | null = null;
  
  /**
   * Task statuses and priorities for template usage
   * Expose these enums to the template to fix template expression errors
   */
  readonly TaskStatus = TaskStatus;
  readonly TaskPriority = TaskPriority;
  
  /**
   * Constructor
   * @param route Activated route for getting route parameters
   * @param router Router for navigation
   * @param taskService Service for task-related API calls
   * @param dialog Dialog service for confirmation dialogs
   * @param snackBar Snackbar for notifications
   */
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly taskService: TaskService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar
  ) {}
  
  /**
   * Lifecycle hook that is called after component initialization
   * Gets task ID from route parameter and loads task data
   */
  ngOnInit(): void {
    // Get task ID from route parameter
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.taskId = id;
        this.loadTask();
      } else {
        this.errorMessage = 'Task ID not provided';
      }
    });
  }
  
  /**
   * Loads task data from API
   */
  loadTask(): void {
    // Set loading state
    this.isLoading = true;
    this.errorMessage = null;
    
    // Call task service to get task by ID
    this.taskService.getTask(this.taskId)
      .pipe(
        // Handle errors
        catchError(error => {
          console.error('Error loading task:', error);
          this.errorMessage = 'Failed to load task. Please try again.';
          return of(null);
        }),
        // Reset loading state when done
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(task => {
        if (task) {
          this.task = task;
        } else if (!this.errorMessage) {
          this.errorMessage = 'Task not found';
        }
      });
  }
  
  /**
   * Navigate to edit task page
   */
  editTask(): void {
    void this.router.navigate(['/tasks/edit', this.taskId]);
  }
  
  /**
   * Delete the current task
   */
  deleteTask(): void {
    if (!this.task) return;
    
    // Confirm deletion
    if (confirm(`Are you sure you want to delete task "${this.task.title}"?`)) {
      this.isLoading = true;
      
      // Call task service to delete task
      this.taskService.deleteTask(this.taskId)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe(success => {
          if (success) {
            // Show success message
            this.snackBar.open('Task deleted successfully', 'Close', {
              duration: 3000
            });
            
            // Navigate back to task list
            void this.router.navigate(['/tasks']);
          } else {
            // Show error message
            this.errorMessage = 'Failed to delete task. Please try again.';
          }
        });
    }
  }
  
  /**
   * Gets the CSS class for task priority
   * @param priority Task priority
   * @returns CSS class name
   */
  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'priority-high';
      case TaskPriority.MEDIUM:
        return 'priority-medium';
      case TaskPriority.LOW:
        return 'priority-low';
      default:
        return '';
    }
  }
  
  /**
   * Gets the CSS class for task status
   * @param status Task status
   * @returns CSS class name
   */
  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'status-todo';
      case TaskStatus.IN_PROGRESS:
        return 'status-in-progress';
      case TaskStatus.DONE:
        return 'status-done';
      default:
        return '';
    }
  }
  
  /**
   * Navigate back to task list
   */
  goBack(): void {
    void this.router.navigate(['/tasks']);
  }

  /**
   * Helper method to display the created by user
   * @param task The task object
   * @returns Formatted display string for created by user
   */
  getCreatedByDisplay(task: Task): string {
    if (!task.createdBy) return '';
    
    if (typeof task.createdBy === 'object') {
      const userRef = task.createdBy as UserReference;
      return userRef.name || userRef.email || '';
    }
    
    return task.createdBy ;
  }

  /**
   * Helper method to display the assigned to user
   * @param task The task object
   * @returns Formatted display string for assigned to user
   */
  getAssignedToDisplay(task: Task): string {
    if (!task.assignedTo) return '';
    
    if (typeof task.assignedTo === 'object') {
      const userRef = task.assignedTo as UserReference;
      return userRef.name || userRef.email || '';
    }
    
    return task.assignedTo ;
  }
}
