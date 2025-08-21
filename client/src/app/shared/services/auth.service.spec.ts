import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import type { User } from '../../core/models/user.model';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../../core/models/auth.model';

// Mock classes
class RouterMock {
  navigate = jasmine.createSpy('navigate');
}

class SnackBarMock {
  open = jasmine.createSpy('open');
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  let snackBar: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useClass: RouterMock },
        { provide: MatSnackBar, useClass: SnackBarMock }
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    snackBar = TestBed.inject(MatSnackBar);
  });

  afterEach(() => {
    // Verify that no requests are outstanding
    httpMock.verify();
  });

  // Test service creation
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test login method
  it('should login user and update user subject', () => {
    // Mock user data with proper typing
    const mockUser: LoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    // Create a properly typed response structure
    const mockResponseData = {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user'
        },
        token: 'mock-token'
      }
    };

    // Call login method
    service.login(mockUser).subscribe((response: AuthResponse & { authSuccess: boolean }) => {
      // Verify response contains expected data
      expect(response.id).toBe('1');
      expect(response.authSuccess).toBeTrue();
    });

    // Expect a POST request to the login endpoint
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    
    // Respond with mock data
    req.flush(mockResponseData);
    
    // Check if user observable was updated
    service.user.subscribe((user: User | null) => {
      expect(user).not.toBeNull();
      if (user) {
        expect(user.id).toBe('1');
        expect(user.name).toBe('Test User');
      }
    });
    
    // Check if isAuthenticated returns true
    expect(service.isAuthenticated()).toBeTrue();
  });

  // Test register method
  it('should register a new user', () => {
    // Mock user data with proper typing
    const mockUser: RegisterRequest = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123'
    };
    
    const mockResponse: AuthResponse = {
      id: '1',
      name: 'New User',
      email: 'new@example.com',
      role: 'user',
      token: 'mock-token'
    };

    // Call register method
    service.register(mockUser).subscribe((response: AuthResponse) => {
      expect(response.id).toBe('1');
      expect(response.name).toBe('New User');
    });

    // Expect a POST request to the register endpoint
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    
    // Respond with mock data
    req.flush(mockResponse);
  });

  // Test logout method
  it('should logout user and clear user subject', () => {
    // Setup: first set a user by accessing the private userSubject property
    // Using type assertion to access private property
    const testUser: User = { 
      id: '1', 
      name: 'Test User', 
      email: 'test@example.com', 
      role: 'user',
      token: 'test-token'
    };
    // Type the service properly to avoid unsafe member access
    const serviceWithPrivateAccess = service as { [key: string]: any };
    serviceWithPrivateAccess['userSubject'].next(testUser);
    
    // Call logout method
    service.logout();

    // Expect a POST request to the logout endpoint
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    
    // Respond with success
    req.flush({ message: 'Logged out successfully' });
    
    // Check if user was cleared
    service.user.subscribe((user: User | null) => {
      expect(user).toBeNull();
    });
    
    // Check if isAuthenticated was updated
    const isAuthenticated = service.isAuthenticated();
    expect(isAuthenticated).toBeFalse();
    
    // Check if router was called to navigate to login
    // Direct access to avoid unbound-method error
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  // Test autoLogin method
  it('should auto login user if token exists', () => {
    // Mock response for verify endpoint with proper structure
    const mockResponse = {
      success: true,
      message: 'Token verified',
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user'
        },
        token: 'mock-token'
      }
    };

    // Call autoLogin method
    service.autoLogin();

    // Expect a GET request to the verify endpoint
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/verify`);
    expect(req.request.method).toBe('GET');
    
    // Respond with mock data
    req.flush(mockResponse);
    
    // Check if user observable was updated
    service.user.subscribe((user: User | null) => {
      expect(user).not.toBeNull();
      if (user) {
        expect(user.id).toBe('1');
        expect(user.name).toBe('Test User');
      }
    });
    
    // Check if isAuthenticated returns true
    expect(service.isAuthenticated()).toBeTrue();
  });
});
