/**
 * My Tasks Component
 * Displays tasks created by the current user
 */
import { Component } from '@angular/core';
import type { OnInit } from '@angular/core';
import { TaskService } from '../../../core/services/task.service';
import type { Task } from '../../../core/models/task.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * My Tasks component
 * Shows tasks created by the current user
 */
@Component({
  selector: 'app-my-tasks',
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.scss']
})
export class MyTasksComponent implements OnInit {
  /**
   * Loading state
   */
  isLoading = false;

  /**
   * Tasks created by the current user
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
   * Fetches my tasks when component initializes
   */
  ngOnInit(): void {
    this.loadMyTasks();
  }

  /**
   * Loads tasks created by the current user from the API
   */
  loadMyTasks(): void {
    // Set loading state to true before API call
    this.isLoading = true;
    this.errorMessage = null;

    // Call the task service to get my tasks
    this.taskService.getMyTasks()
      .pipe(
        // Handle any errors that occur during the API call
        catchError(error => {
          console.error('Error fetching my tasks:', error);
          this.errorMessage = 'Failed to load tasks. Please try again later.';
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
}
