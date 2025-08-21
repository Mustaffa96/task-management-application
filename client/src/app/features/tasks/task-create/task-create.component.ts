/**
 * Task Create Component
 * Handles creation of new tasks
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { TaskPriority } from '../../../core/models/task.model';
import type { CreateTaskRequest } from '../../../core/models/task.model';
import type { User } from '../../../core/models/user.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Task Create component
 * Provides form for creating new tasks
 */
@Component({
  selector: 'app-task-create',
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss']
})
export class TaskCreateComponent implements OnInit {
  /**
   * Task creation form
   */
  taskForm: FormGroup;
  
  /**
   * Loading state for form submission
   */
  isSubmitting = false;
  
  /**
   * Loading state for users list
   */
  isLoadingUsers = false;
  
  /**
   * List of users for assignment dropdown
   */
  users: User[] = [];
  
  /**
   * Error message if API call fails
   */
  errorMessage: string | null = null;
  
  /**
   * Task priority enum for template usage
   */
  readonly TaskPriority = TaskPriority;

  /**
   * Priority options for dropdown
   * Using lowercase values to match backend TaskPriority enum
   */
  priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];
  
  /**
   * Constructor
   * @param fb Form builder for creating reactive forms
   * @param taskService Service for task-related API calls
   * @param userService Service for user-related API calls
   * @param router Angular router for navigation
   */
  constructor(
    private readonly fb: FormBuilder,
    private readonly taskService: TaskService,
    private readonly userService: UserService,
    private readonly router: Router
  ) {
    // Initialize the form with validators
    // Use arrow functions to avoid unbound-method errors
    const requiredValidator = () => Validators.required;
    const minLengthValidator = (length: number) => Validators.minLength(length);
    const maxLengthValidator = (length: number) => Validators.maxLength(length);
    
    this.taskForm = this.fb.group({
      title: ['', [requiredValidator(), minLengthValidator(3), maxLengthValidator(100)]],
      description: ['', [requiredValidator(), minLengthValidator(10), maxLengthValidator(1000)]],
      priority: ['medium', requiredValidator()],
      dueDate: [null],
      assignedTo: ['']
    });
  }
  
  /**
   * Lifecycle hook that is called after component initialization
   * Loads users for assignment dropdown
   */
  ngOnInit(): void {
    this.loadUsers();
  }
  
  /**
   * Loads users from the API for assignment dropdown
   */
  loadUsers(): void {
    this.isLoadingUsers = true;
    
    this.userService.getUsers()
      .pipe(
        catchError(error => {
          console.error('Error loading users:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoadingUsers = false;
        })
      )
      .subscribe((users: User[]) => {
        this.users = users;
      });
  }
  
  /**
   * Submits the form to create a new task
   */
  onSubmit(): void {
    // Return if form is invalid
    if (this.taskForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.taskForm.controls).forEach(key => {
        this.taskForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    // Set submitting state
    this.isSubmitting = true;
    this.errorMessage = null;
    
    // Get form values
    const taskData = this.taskForm.value;
    
    // Remove empty assignedTo if not selected
    if (!taskData.assignedTo) {
      delete taskData.assignedTo;
    }
    
    // Call service to create task
    this.taskService.createTask(taskData)
      .pipe(
        catchError(error => {
          console.error('Error creating task:', error);
          this.errorMessage = 'Failed to create task. Please try again later.';
          return of(null);
        }),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe(result => {
        if (result) {
          // Navigate to my tasks page on success
          void this.router.navigate(['/tasks/my-tasks']);
        }
      });
  }
  
  /**
   * Helper method to check if a form control has a specific error
   * @param controlName Name of the form control
   * @param errorName Name of the error to check
   * @returns Boolean indicating if the error exists
   */
  hasError(controlName: string, errorName: string): boolean {
    const control = this.taskForm.get(controlName);
    return !!(control && control.touched && control.hasError(errorName));
  }
}
