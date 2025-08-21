/**
 * Task Edit component
 * Allows users to edit existing tasks
 */
import { Component } from '@angular/core';
import type { OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import type { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { TaskStatus, TaskPriority } from '../../../core/models/task.model';
import type { Task, UpdateTaskRequest } from '../../../core/models/task.model';
import type { User } from '../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Task Edit component
 * Form for editing existing tasks
 */
@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss']
})
export class TaskEditComponent implements OnInit {
  /**
   * Task ID from route parameter
   */
  taskId = '';
  
  /**
   * Original task data
   */
  originalTask: Task | null = null;
  
  /**
   * Task edit form
   */
  taskForm: FormGroup;
  
  /**
   * Loading state
   */
  isLoading = false;
  
  /**
   * Submitting state
   */
  isSubmitting = false;
  
  /**
   * Error message
   */
  errorMessage: string | null = null;
  
  /**
   * Available users for assignment
   */
  users: User[] = [];
  
  /**
   * Task status and priority enums for template usage
   */
  readonly TaskStatus = TaskStatus;
  readonly TaskPriority = TaskPriority;

  /**
   * Task status options for dropdown
   */
  statusOptions = [
    { value: TaskStatus.TODO, label: 'To Do' },
    { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { value: TaskStatus.DONE, label: 'Done' }
  ];
  
  /**
   * Task priority options for dropdown
   */
  priorityOptions = [
    { value: TaskPriority.HIGH, label: 'High' },
    { value: TaskPriority.MEDIUM, label: 'Medium' },
    { value: TaskPriority.LOW, label: 'Low' }
  ];
  
  /**
   * Constructor
   * @param fb Form builder for creating reactive forms
   * @param route Activated route for getting route parameters
   * @param router Router for navigation
   * @param taskService Service for task-related API calls
   * @param userService Service for user-related API calls
   * @param snackBar Snackbar for notifications
   */
  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly taskService: TaskService,
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar
  ) {
    // Initialize form with empty values
    // Use arrow functions to avoid unbound-method errors
    const requiredValidator = () => Validators.required;
    const maxLengthValidator = (length: number) => Validators.maxLength(length);
    
    this.taskForm = this.fb.group({
      title: ['', [requiredValidator(), maxLengthValidator(100)]],
      description: ['', [requiredValidator(), maxLengthValidator(1000)]],
      status: [TaskStatus.TODO, requiredValidator()],
      priority: [TaskPriority.MEDIUM, requiredValidator()],
      dueDate: [null],
      assignedTo: ['']
    });
  }
  
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
        this.loadUsers();
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
          this.originalTask = task;
          
          // Populate form with task data
          this.taskForm.patchValue({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
            assignedTo: task.assignedTo || ''
          });
        } else if (!this.errorMessage) {
          this.errorMessage = 'Task not found';
        }
      });
  }
  
  /**
   * Loads users for assignment dropdown
   */
  loadUsers(): void {
    this.userService.getUsers()
      .pipe(
        catchError(error => {
          console.error('Error loading users:', error);
          return of([]);
        })
      )
      .subscribe(users => {
        this.users = users;
      });
  }
  
  /**
   * Submits the form to update the task
   */
  onSubmit(): void {
    // Return if form is invalid
    if (this.taskForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.taskForm.controls).forEach(key => {
        const control = this.taskForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    // Set submitting state
    this.isSubmitting = true;
    
    // Create update request from form values
    const updateData: UpdateTaskRequest = {
      title: this.taskForm.value.title,
      description: this.taskForm.value.description,
      status: this.taskForm.value.status,
      priority: this.taskForm.value.priority,
      dueDate: this.taskForm.value.dueDate,
      assignedTo: this.taskForm.value.assignedTo || undefined
    };
    
    // Call task service to update task
    this.taskService.updateTask(this.taskId, updateData)
      .pipe(
        // Reset submitting state when done
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe(updatedTask => {
        if (updatedTask) {
          // Show success message
          this.snackBar.open('Task updated successfully', 'Close', {
            duration: 3000
          });
          
          // Navigate to task detail page
          void this.router.navigate(['/tasks', this.taskId]);
        } else {
          // Show error message
          this.errorMessage = 'Failed to update task. Please try again.';
        }
      });
  }
  
  /**
   * Cancel edit and navigate back
   */
  cancel(): void {
    void this.router.navigate(['/tasks', this.taskId]);
  }
}
