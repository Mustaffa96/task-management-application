/**
 * Task Service
 * Handles API communication for task management
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  private apiUrl = `${environment.apiUrl}/tasks`;
  
  /**
   * Constructor
   * @param http HttpClient for API requests
   */
  constructor(private http: HttpClient) {}
  
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
    
    // Make API request with query parameters
    return this.http.get<Task[]>(this.apiUrl, { params }).pipe(
      map(tasks => this.transformTaskDates(tasks))
    );
  }
  
  /**
   * Get tasks created by the current user
   * @returns Observable of task array
   */
  getMyTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/my-tasks`).pipe(
      map(tasks => this.transformTaskDates(tasks))
    );
  }
  
  /**
   * Get tasks assigned to the current user
   * @returns Observable of task array
   */
  getAssignedTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/assigned`).pipe(
      map(tasks => this.transformTaskDates(tasks))
    );
  }
  
  /**
   * Get a single task by ID
   * @param id Task ID
   * @returns Observable of task
   */
  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(
      map(task => this.transformTaskDates([task])[0])
    );
  }
  
  /**
   * Create a new task
   * @param task Task creation data
   * @returns Observable of created task
   */
  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task).pipe(
      map(task => this.transformTaskDates([task])[0])
    );
  }
  
  /**
   * Update an existing task
   * @param id Task ID
   * @param task Task update data
   * @returns Observable of updated task
   */
  updateTask(id: string, task: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task).pipe(
      map(task => this.transformTaskDates([task])[0])
    );
  }
  
  /**
   * Delete a task
   * @param id Task ID
   * @returns Observable of deletion result
   */
  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  /**
   * Transform date strings to Date objects
   * @param tasks Array of tasks with string dates
   * @returns Array of tasks with proper Date objects
   */
  private transformTaskDates(tasks: any[]): Task[] {
    return tasks.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined
    }));
  }
}
