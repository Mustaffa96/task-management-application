/**
 * Task Service
 * Handles API communication for task management
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskFilter 
} from '../models/task.model';

/**
 * Task Service
 * Provides methods for interacting with the task API
 */
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  /**
   * API URL for task endpoints
   */
  private readonly apiUrl = `${environment.apiUrl}/tasks`;
  
  /**
   * Constructor
   * @param http HttpClient for API requests
   */
  constructor(private readonly http: HttpClient) {}
  
  /**
   * Get all tasks with optional filtering
   * @param filter Optional task filter criteria
   * @returns Observable of task array
   */
  getTasks(filter?: TaskFilter): Observable<Task[]> {
    // Build query parameters from filter
    let params = new HttpParams();
    
    if (filter) {
      if (filter.status) {
        params = params.append('status', filter.status);
      }
      
      if (filter.priority) {
        params = params.append('priority', filter.priority);
      }
      
      if (filter.createdBy) {
        params = params.append('createdBy', filter.createdBy);
      }
      
      if (filter.assignedTo) {
        params = params.append('assignedTo', filter.assignedTo);
      }
      
      if (filter.dueDateFrom) {
        params = params.append('dueDateFrom', filter.dueDateFrom.toISOString());
      }
      
      if (filter.dueDateTo) {
        params = params.append('dueDateTo', filter.dueDateTo.toISOString());
      }
    }
    
    // Log for debugging
    console.log('Fetching tasks with params:', params.toString() || 'none');
    
    // Make API request with query parameters
    return this.http.get<{success: boolean, message: string, data: Task[]}>(this.apiUrl, { params }).pipe(
      map(response => {
        console.log('Tasks fetched successfully:', response.data?.length || 0);
        return this.transformTaskDates(response.data || []);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching tasks:', error);
        
        // Special handling for authentication errors
        // Don't throw the error for 401 responses to prevent automatic logout
        // The error interceptor will still try to refresh the token
        if (error.status === 401) {
          console.warn('Authentication error when fetching tasks. Token may be invalid or expired.');
          // Return empty array instead of throwing error to prevent navigation issues
          return of([]);
        }
        
        // For other errors, return empty array
        return of([]);
      })
    );
  }
  
  /**
   * Get tasks created by the current user
   * @returns Observable of task array
   */
  getMyTasks(): Observable<Task[]> {
    console.log('Fetching my tasks');
    return this.http.get<{success: boolean, message: string, data: Task[]}>(`${this.apiUrl}/my-tasks`).pipe(
      map(response => {
        console.log('My tasks fetched successfully:', response.data?.length || 0);
        return this.transformTaskDates(response.data || []);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching my tasks:', error);
        
        // Special handling for authentication errors
        if (error.status === 401) {
          console.warn('Authentication error when fetching my tasks. Token may be invalid or expired.');
          return of([]);
        }
        
        return of([]);
      })
    );
  }
  
  /**
   * Get tasks assigned to the current user
   * @returns Observable of task array
   */
  getAssignedTasks(): Observable<Task[]> {
    console.log('Fetching assigned tasks');
    return this.http.get<{success: boolean, message: string, data: Task[]}>(`${this.apiUrl}/assigned`).pipe(
      map(response => {
        console.log('Assigned tasks fetched successfully:', response.data?.length || 0);
        return this.transformTaskDates(response.data || []);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching assigned tasks:', error);
        
        // Special handling for authentication errors
        if (error.status === 401) {
          console.warn('Authentication error when fetching assigned tasks. Token may be invalid or expired.');
          return of([]);
        }
        
        return of([]);
      })
    );
  }
  
  /**
   * Get a single task by ID
   * @param id Task ID
   * @returns Observable of task
   */
  getTask(id: string): Observable<Task | null> {
    console.log(`Fetching task with ID: ${id}`);
    return this.http.get<{success: boolean, message: string, data: Task}>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        console.log('Task fetched successfully:', response.data);
        return this.transformTaskDates([response.data])[0];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Error fetching task ${id}:`, error);
        return of(null);
      })
    );
  }
  
  /**
   * Create a new task
   * @param task Task creation data
   * @returns Observable of created task
   */
  createTask(task: CreateTaskRequest): Observable<Task | null> {
    console.log('Creating new task:', task.title);
    return this.http.post<{success: boolean, message: string, data: Task}>(this.apiUrl, task).pipe(
      map(response => {
        console.log('Task created successfully:', response.data.id);
        return this.transformTaskDates([response.data])[0];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error creating task:', error);
        return of(null);
      })
    );
  }
  
  /**
   * Update an existing task
   * @param id Task ID
   * @param task Task update data
   * @returns Observable of updated task
   */
  updateTask(id: string, task: UpdateTaskRequest): Observable<Task | null> {
    console.log(`Updating task ${id}:`, task);
    return this.http.put<{success: boolean, message: string, data: Task}>(`${this.apiUrl}/${id}`, task).pipe(
      map(response => {
        console.log('Task updated successfully:', response.data.id);
        return this.transformTaskDates([response.data])[0];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Error updating task ${id}:`, error);
        return of(null);
      })
    );
  }
  
  /**
   * Delete a task
   * @param id Task ID
   * @returns Observable of deletion result
   */
  deleteTask(id: string): Observable<boolean> {
    console.log(`Deleting task ${id}`);
    return this.http.delete<{success: boolean, message: string}>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        console.log(`Task ${id} deleted successfully`);
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Error deleting task ${id}:`, error);
        return of(false);
      })
    );
  }
  
  /**
   * Transform date strings to Date objects
   * @param tasks Array of tasks with string dates
   * @returns Array of tasks with proper Date objects
   */
  private transformTaskDates(tasks: Task[]): Task[] {
    return tasks.map((task: Task) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined
    }));
  }
}
