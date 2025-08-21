/**
 * Task List component
 * Displays and manages user tasks
 */
import { Component } from '@angular/core';
import type { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { TaskStatus, TaskPriority } from '../../../core/models/task.model';
import type { Task } from '../../../core/models/task.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import type { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

/**
 * Interface for filter form values
 */
interface FilterFormValues {
  status: string;
  priority: string;
  searchTerm: string;
  showMyTasksOnly: boolean;
}

/**
 * Task List component
 * Main component for displaying and managing tasks
 */
@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  /**
   * Loading state
   */
  isLoading = false;

  /**
   * Tasks array
   */
  tasks: Task[] = [];

  /**
   * All tasks (unfiltered)
   */
  allTasks: Task[] = [];

  /**
   * Error message if API call fails
   */
  errorMessage: string | null = null;

  /**
   * Task status enum for template usage
   */
  TaskStatus = TaskStatus;

  /**
   * Task priority enum for template usage
   */
  TaskPriority = TaskPriority;
  
  /**
   * Filter form group
   */
  filterForm: FormGroup;

  /**
   * Status options for filter dropdown
   */
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: TaskStatus.TODO, label: 'To Do' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.DONE, label: 'Done' }
  ];

  /**
   * Priority options for filter dropdown
   */
  priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: TaskPriority.HIGH, label: 'High' },
    { value: TaskPriority.MEDIUM, label: 'Medium' },
    { value: TaskPriority.LOW, label: 'Low' }
  ];
  
  /**
   * Constructor
   * @param taskService Service for task-related API calls
   * @param fb Form builder for creating reactive forms
   */
  constructor(
    private readonly taskService: TaskService,
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog
  ) { 
    // Initialize filter form
    this.filterForm = this.fb.group({
      status: [''],
      priority: [''],
      searchTerm: [''],
      showMyTasksOnly: [false]
    });
  }
  
  /**
   * Lifecycle hook that is called after component initialization
   * Fetches tasks when component initializes and sets up filter form subscription
   */
  ngOnInit(): void {
    this.loadTasks();
    
    // Subscribe to filter form changes to apply filters
    // Use proper typing for the filter form values
    this.filterForm.valueChanges.subscribe((): void => {
      this.applyFilters();
    });
  }

  /**
   * Loads tasks from the API
   */
  loadTasks(): void {
    // Set loading state to true before API call
    this.isLoading = true;
    this.errorMessage = null;

    // Call the task service to get all tasks
    this.taskService.getTasks()
      .pipe(
        // Handle any errors that occur during the API call
        catchError(error => {
          console.error('Error fetching tasks:', error);
          this.errorMessage = 'Failed to load tasks. Please try again later.';
          return of([]);
        }),
        // Always set loading to false when done, whether successful or not
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(tasks => {
        this.allTasks = tasks;
        this.applyFilters(); // Apply any filters that might be set
      });
  }
  
  /**
   * Applies filters to the tasks based on the filter form values
   */
  applyFilters(): void {
    const filters = this.filterForm.value as FilterFormValues;
    let filteredTasks = [...this.allTasks];
    
    // Filter by status if selected
    if (filters.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }
    
    // Filter by priority if selected
    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }
    
    // Filter by search term if provided
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) || 
        task.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter to show only tasks assigned to current user if selected
    if (filters.showMyTasksOnly) {
      this.taskService.getAssignedTasks()
        .subscribe(myTasks => {
          const myTaskIds = myTasks.map(task => task.id);
          filteredTasks = filteredTasks.filter(task => myTaskIds.includes(task.id));
          this.tasks = filteredTasks;
        });
    } else {
      this.tasks = filteredTasks;
    }
  }
  
  /**
   * Resets all filters to their default values
   */
  resetFilters(): void {
    this.filterForm.reset({
      // Type the reset values to match FilterFormValues
      status: '',
      priority: '',
      searchTerm: '',
      showMyTasksOnly: false
    });
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
   * Navigate to task detail view
   * @param taskId Task ID to view
   */
  viewTask(taskId: string): void {
    void this.router.navigate(['/tasks', taskId]);
  }
  
  /**
   * Navigate to task edit view
   * @param taskId Task ID to edit
   * @param event Click event
   */
  editTask(taskId: string, event: Event): void {
    // Prevent event bubbling to parent elements
    event.stopPropagation();
    void this.router.navigate(['/tasks/edit', taskId]);
  }
  
  /**
   * Delete a task
   * @param taskId Task ID to delete
   * @param taskTitle Task title for confirmation
   * @param event Click event
   */
  deleteTask(taskId: string, taskTitle: string, event: Event): void {
    // Prevent event bubbling to parent elements
    event.stopPropagation();
    
    // Confirm deletion
    if (confirm(`Are you sure you want to delete task "${taskTitle}"?`)) {
      this.taskService.deleteTask(taskId)
        .subscribe(success => {
          if (success) {
            // Show success message
            this.snackBar.open('Task deleted successfully', 'Close', {
              duration: 3000
            });
            
            // Reload tasks
            this.loadTasks();
          } else {
            // Show error message
            this.snackBar.open('Failed to delete task', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });
    }
  }
}
