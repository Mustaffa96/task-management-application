import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

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
  it('should login user and update currentUserSubject', () => {
    // Mock user data
    const mockUser = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const mockResponse = {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      },
      token: 'mock-token'
    };

    // Call login method
    service.login(mockUser).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    // Expect a POST request to the login endpoint
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    
    // Respond with mock data
    req.flush(mockResponse);
    
    // Check if currentUserSubject was updated
    service.currentUser$.subscribe(user => {
      expect(user).toEqual(mockResponse.user);
    });
    
    // Check if isAuthenticated was updated
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBeTrue();
    });
  });

  // Test register method
  it('should register a new user', () => {
    // Mock user data
    const mockUser = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123'
    };
    
    const mockResponse = {
      message: 'User registered successfully'
    };

    // Call register method
    service.register(mockUser).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    // Expect a POST request to the register endpoint
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    
    // Respond with mock data
    req.flush(mockResponse);
  });

  // Test logout method
  it('should logout user and clear currentUserSubject', () => {
    // Setup: first set a user
    service['currentUserSubject'].next({ id: '1', name: 'Test User', email: 'test@example.com', role: 'user' });
    
    // Call logout method
    service.logout();

    // Expect a POST request to the logout endpoint
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
    expect(req.request.method).toBe('POST');
    
    // Respond with success
    req.flush({ message: 'Logged out successfully' });
    
    // Check if currentUserSubject was cleared
    service.currentUser$.subscribe(user => {
      expect(user).toBeNull();
    });
    
    // Check if isAuthenticated was updated
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBeFalse();
    });
    
    // Check if router was called to navigate to login
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  // Test autoLogin method
  it('should auto login user if token exists', () => {
    // Mock response for refresh token endpoint
    const mockResponse = {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }
    };

    // Call autoLogin method
    service.autoLogin();

    // Expect a GET request to the refresh token endpoint
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh-token`);
    expect(req.request.method).toBe('GET');
    
    // Respond with mock data
    req.flush(mockResponse);
    
    // Check if currentUserSubject was updated
    service.currentUser$.subscribe(user => {
      expect(user).toEqual(mockResponse.user);
    });
    
    // Check if isAuthenticated was updated
    service.isAuthenticated$.subscribe(isAuth => {
      expect(isAuth).toBeTrue();
    });
  });
});
