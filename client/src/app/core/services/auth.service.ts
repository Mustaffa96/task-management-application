/**
 * Authentication service
 * Handles user authentication, registration, and session management
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '../models/user.model';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

/**
 * Authentication service
 * Manages user authentication state and API communication
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * BehaviorSubject to track and broadcast the current user state
   * Initialized as null (not authenticated)
   */
  private userSubject = new BehaviorSubject<User | null>(null);
  
  /**
   * Observable of the current user state
   * Components can subscribe to this to react to auth state changes
   */
  user = this.userSubject.asObservable();
  
  /**
   * API URL for authentication endpoints
   */
  private apiUrl = `${environment.apiUrl}/auth`;
  
  /**
   * Constructor
   * @param http HttpClient for API requests
   * @param router Angular router for navigation
   */
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
  
  /**
   * Register a new user
   * @param registerData User registration data
   * @returns Observable of the registration response
   */
  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData)
      .pipe(
        tap(response => {
          // Auto-login after successful registration
          this.handleAuthentication(response);
        }),
        catchError(this.handleError)
      );
  }
  
  /**
   * Login an existing user
   * @param loginData User login credentials
   * @returns Observable of the login response
   */
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData, {
      // Include credentials to allow cookies to be sent/received
      withCredentials: true
    }).pipe(
      tap(response => {
        this.handleAuthentication(response);
      }),
      catchError(this.handleError)
    );
  }
  
  /**
   * Logout the current user
   * Clears the user state and redirects to login
   */
  logout(): void {
    // Call the logout endpoint to clear server-side session/cookies
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          // Clear user state
          this.userSubject.next(null);
          
          // Clear any stored user data
          localStorage.removeItem('userData');
          
          // Redirect to login page
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Logout error:', error);
          
          // Even if the API call fails, clear local state
          this.userSubject.next(null);
          localStorage.removeItem('userData');
          this.router.navigate(['/login']);
        }
      });
  }
  
  /**
   * Attempt to automatically login the user from stored data
   * Called on application startup
   */
  autoLogin(): void {
    // Check if we have stored user data
    const userData = localStorage.getItem('userData');
    
    if (!userData) {
      return;
    }
    
    // Parse the stored user data
    const user: User = JSON.parse(userData);
    
    if (user) {
      // Update the user subject with the stored user
      this.userSubject.next(user);
      
      // Verify the token is still valid with the server
      this.verifyToken();
    }
  }
  
  /**
   * Verify if the current token is still valid
   */
  private verifyToken(): void {
    this.http.get<AuthResponse>(`${this.apiUrl}/refresh`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          // Update user data with fresh data from server
          this.handleAuthentication(response);
        },
        error: () => {
          // Token is invalid, logout the user
          this.logout();
        }
      });
  }
  
  /**
   * Get the current user value
   * @returns The current user or null if not authenticated
   */
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }
  
  /**
   * Check if the user is authenticated
   * @returns True if user is authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }
  
  /**
   * Check if the user has a specific role
   * @param role Role to check for
   * @returns True if user has the role, false otherwise
   */
  hasRole(role: string): boolean {
    const user = this.userSubject.value;
    return !!user && user.role === role;
  }
  
  /**
   * Handle successful authentication
   * @param response Authentication response from API
   */
  private handleAuthentication(response: AuthResponse): void {
    // Create user object from response
    const user: User = {
      id: response.id,
      name: response.name,
      email: response.email,
      role: response.role,
      token: response.token
    };
    
    // Update the user subject
    this.userSubject.next(user);
    
    // Store user data in localStorage for auto-login
    localStorage.setItem('userData', JSON.stringify(user));
  }
  
  /**
   * Handle API errors
   * @param error Error from API
   * @returns Observable error
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
