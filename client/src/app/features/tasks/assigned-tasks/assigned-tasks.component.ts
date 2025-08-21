/**
 * Assigned Tasks Component
 * Displays tasks assigned to the current user
 */
import { Component } from '@angular/core';
import type { OnInit } from '@angular/core';
import { TaskService } from '../../../core/services/task.service';
import type { Task } from '../../../core/models/task.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Assigned Tasks component
 * Shows tasks assigned to the current user
 */
@Component({
  selector: 'app-assigned-tasks',
  templateUrl: './assigned-tasks.component.html',
  styleUrls: ['./assigned-tasks.component.scss']
})
export class AssignedTasksComponent implements OnInit {
  /**
   * Loading state
   */
  isLoading = false;

  /**
   * Tasks assigned to the current user
   */
  tasks: Task[] = [];

  /**
   * Error message if API call fails
   */
  errorMessage: string | null = null;
  
  /**
   * Constructor
   * @param taskService Service for task-related API calls
   */
  constructor(private readonly taskService: TaskService) { }
  
  /**
   * Lifecycle hook that is called after component initialization
   * Fetches assigned tasks when component initializes
   */
  ngOnInit(): void {
    this.loadAssignedTasks();
  }

  /**
   * Loads tasks assigned to the current user from the API
   */
  loadAssignedTasks(): void {
    // Set loading state to true before API call
    this.isLoading = true;
    this.errorMessage = null;

    // Call the task service to get assigned tasks
    this.taskService.getAssignedTasks()
      .pipe(
        // Handle any errors that occur during the API call
        catchError(error => {
          console.error('Error fetching assigned tasks:', error);
          this.errorMessage = 'Failed to load assigned tasks. Please try again later.';
          return of([]); // Return observable with empty array to continue the stream
        }),
        // Always set loading to false when done, whether successful or not
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(tasks => {
        this.tasks = tasks;
      });
  }

  /**
   * Updates the status of a task
   * @param taskId The ID of the task to update
   * @param newStatus The new status value
   */
  updateTaskStatus(taskId: string, newStatus: string): void {
    // Implementation for updating task status would go here
    console.log(`Updating task ${taskId} status to ${newStatus}`);
  }
}
