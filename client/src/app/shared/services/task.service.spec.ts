import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TaskService } from './task.service';
import { environment } from '../../../environments/environment';
import { Task } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });
    
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no requests are outstanding
    httpMock.verify();
  });

  // Test service creation
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test getTasks method
  it('should retrieve tasks from the API', () => {
    // Mock tasks data
    const mockTasks: Task[] = [
      { 
        id: '1', 
        title: 'Task 1', 
        description: 'Description 1', 
        status: 'todo', 
        priority: 'high',
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: '123'
      },
      { 
        id: '2', 
        title: 'Task 2', 
        description: 'Description 2', 
        status: 'in-progress', 
        priority: 'medium',
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: '123'
      }
    ];

    // Call getTasks method
    service.getTasks().subscribe(tasks => {
      expect(tasks).toEqual(mockTasks);
    });

    // Expect a GET request to the tasks endpoint
    const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
    expect(req.request.method).toBe('GET');
    
    // Respond with mock data
    req.flush(mockTasks);
  });

  // Test getTask method
  it('should retrieve a single task by ID', () => {
    // Mock task data
    const mockTask: Task = { 
      id: '1', 
      title: 'Task 1', 
      description: 'Description 1', 
      status: 'todo', 
      priority: 'high',
      dueDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: '123'
    };

    // Call getTask method
    service.getTask('1').subscribe(task => {
      expect(task).toEqual(mockTask);
    });

    // Expect a GET request to the task endpoint with ID
    const req = httpMock.expectOne(`${environment.apiUrl}/tasks/1`);
    expect(req.request.method).toBe('GET');
    
    // Respond with mock data
    req.flush(mockTask);
  });

  // Test createTask method
  it('should create a new task', () => {
    // Mock task data
    const newTask = { 
      title: 'New Task', 
      description: 'New Description', 
      status: 'todo', 
      priority: 'high',
      dueDate: new Date()
    };
    
    const mockResponse = { 
      id: '3', 
      ...newTask,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: '123'
    };

    // Call createTask method
    service.createTask(newTask).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    // Expect a POST request to the tasks endpoint
    const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newTask);
    
    // Respond with mock data
    req.flush(mockResponse);
  });

  // Test updateTask method
  it('should update an existing task', () => {
    // Mock task data
    const taskId = '1';
    const updatedTask = { 
      title: 'Updated Task', 
      description: 'Updated Description', 
      status: 'in-progress', 
      priority: 'medium',
      dueDate: new Date()
    };
    
    const mockResponse = { 
      id: taskId, 
      ...updatedTask,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: '123'
    };

    // Call updateTask method
    service.updateTask(taskId, updatedTask).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    // Expect a PUT request to the tasks endpoint with ID
    const req = httpMock.expectOne(`${environment.apiUrl}/tasks/${taskId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedTask);
    
    // Respond with mock data
    req.flush(mockResponse);
  });

  // Test deleteTask method
  it('should delete a task', () => {
    // Mock task ID
    const taskId = '1';
    
    const mockResponse = { message: 'Task deleted successfully' };

    // Call deleteTask method
    service.deleteTask(taskId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    // Expect a DELETE request to the tasks endpoint with ID
    const req = httpMock.expectOne(`${environment.apiUrl}/tasks/${taskId}`);
    expect(req.request.method).toBe('DELETE');
    
    // Respond with mock data
    req.flush(mockResponse);
  });
});
