import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    
    service = TestBed.inject(UserService);
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

  // Test getCurrentUser method
  it('should retrieve current user profile', () => {
    // Mock user data
    const mockUser: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    };

    // Call getCurrentUser method
    service.getCurrentUser().subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    // Expect a GET request to the users/me endpoint
    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    expect(req.request.method).toBe('GET');
    
    // Respond with mock data
    req.flush(mockUser);
  });

  // Test updateProfile method
  it('should update user profile', () => {
    // Mock user data
    const updatedProfile = {
      name: 'Updated Name',
      email: 'updated@example.com'
    };
    
    const mockResponse = {
      id: '1',
      ...updatedProfile,
      role: 'user'
    };

    // Call updateProfile method
    service.updateProfile(updatedProfile).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    // Expect a PUT request to the users/me endpoint
    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedProfile);
    
    // Respond with mock data
    req.flush(mockResponse);
  });

  // Test changePassword method
  it('should change user password', () => {
    // Mock password data
    const passwordData = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword456'
    };
    
    const mockResponse = { message: 'Password changed successfully' };

    // Call changePassword method
    service.changePassword(passwordData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    // Expect a POST request to the users/change-password endpoint
    const req = httpMock.expectOne(`${environment.apiUrl}/users/change-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(passwordData);
    
    // Respond with mock data
    req.flush(mockResponse);
  });

  // Test getUsers method (admin only)
  it('should retrieve all users (admin only)', () => {
    // Mock users data
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'User One',
        email: 'user1@example.com',
        role: 'user'
      },
      {
        id: '2',
        name: 'User Two',
        email: 'user2@example.com',
        role: 'admin'
      }
    ];

    // Call getUsers method
    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });

    // Expect a GET request to the users endpoint
    const req = httpMock.expectOne(`${environment.apiUrl}/users`);
    expect(req.request.method).toBe('GET');
    
    // Respond with mock data
    req.flush(mockUsers);
  });

  // Test getUserById method (admin only)
  it('should retrieve a user by ID (admin only)', () => {
    // Mock user ID and data
    const userId = '1';
    const mockUser: User = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    };

    // Call getUserById method
    service.getUserById(userId).subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    // Expect a GET request to the users endpoint with ID
    const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}`);
    expect(req.request.method).toBe('GET');
    
    // Respond with mock data
    req.flush(mockUser);
  });
});
