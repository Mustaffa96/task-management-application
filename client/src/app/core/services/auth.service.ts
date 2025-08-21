/**
 * Authentication service
 * Handles user authentication, registration, and session management
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, from, of } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '../models/user.model';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

/**
 * Authentication service
 * Manages user authentication state and API communication
 * Uses HttpOnly cookies for secure token storage
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * BehaviorSubject to track and broadcast the current user state
   * Initialized as null (not authenticated)
   */
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  
  /**
   * Observable of the current user state
   * Components can subscribe to this to react to auth state changes
   */
  user = this.userSubject.asObservable();
  
  /**
   * API URL for authentication endpoints
   */
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  
  /**
   * Token refresh timer subscription
   */
  private refreshTokenTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Constructor
   * @param http HttpClient for API requests
   * @param router Angular router for navigation
   */
  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
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
        catchError((error) => this.handleError(error))
      );
  }
  
  /**
   * Log in a user
   * @param loginData Login credentials
   * @returns Observable of authentication response with authentication state
   */
  login(loginData: LoginRequest): Observable<AuthResponse & { authSuccess: boolean }> {
    // Clear any existing user data before attempting login
    this.logout(false);
    
    // Log for debugging
    console.log('Attempting login with:', { email: loginData.email });
    
    return this.http.post<{success: boolean, message: string, data: {user: AuthResponse, token: string}}>(
      `${this.apiUrl}/login`,
      loginData,
      { withCredentials: true }
    ).pipe(
      switchMap(response => {
        // Extract the user and token from the nested response structure
        const userData = response.data?.user;
        const token = response.data?.token;
        
        // Log successful login
        console.log('Login successful, processing response:', {
          hasToken: !!token,
          tokenLength: token ? token.length : 0,
          userId: userData?.id
        });
        
        // Validate response has required data
        if (!userData || !token || !userData.id) {
          console.error('Invalid login response from server:', response);
          return of({
            ...userData ,
            authSuccess: false
          });
        }
        
        // Create a properly formatted AuthResponse
        const authResponse: AuthResponse = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          token: token
        };
        
        // Handle authentication and return enhanced response
        return from(this.handleAuthentication(authResponse)).pipe(
          map((authSuccess: boolean) => {
            // Double-check authentication state
            const isAuthenticated = this.isAuthenticated();
            console.log('Authentication state check:', { 
              authSuccess, 
              isAuthenticated,
              userExists: !!this.userSubject.value
            });
            
            // Return enhanced response
            return {
              ...authResponse,
              authSuccess: isAuthenticated
            };
          })
        );
      }),
      catchError(error => {
        console.error('Login error:', error);
        return this.handleError(error);
      })
    );
  }
  
  /**
   * Logout the current user
   * Clears the user state and redirects to login
   * @param navigateToLogin Whether to navigate to login page after logout
   */
  logout(navigateToLogin = true): void {
    // Stop the token refresh timer
    this.stopRefreshTokenTimer();
    
    // Call the logout endpoint to clear server-side session/cookies
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          // Clear user state
          this.userSubject.next(null);
          
          // Redirect to login page
          if (navigateToLogin) {
            void this.router.navigate(['/login']);
          }
        },
        error: (error) => {
          console.error('Logout error:', error);
          
          // Even if the API call fails, clear local state
          this.userSubject.next(null);
          
          if (navigateToLogin) {
            void this.router.navigate(['/login']);
          }
        }
      });
  }
  
  /**
   * Attempt to automatically login the user from stored data
   * Called on application startup
   */
  autoLogin(): void {
    console.log('Attempting auto-login using server-side session');
    
    // Instead of using localStorage, we'll verify the token with the server
    // The server will use the HttpOnly cookie that was set during login
    this.http.get<{success: boolean, message: string, data: {user: AuthResponse, token: string}}>(`${this.apiUrl}/verify`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          console.log('Auto-login successful, received user data from server');
          
          // Extract user data and token from the nested response
          const userData = response.data?.user;
          const token = response.data?.token;
          
          // Create user object from response
          if (userData && userData.id && token) {
            const user: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              token: token
            };
            
            // Update the user subject
            this.userSubject.next(user);
            
            // Start token refresh timer
            this.startRefreshTokenTimer();
            
            console.log('Auto-login complete, user authenticated');
          } else {
            console.warn('Invalid user data received during auto-login');
          }
        },
        error: (error) => {
          console.error('Auto-login failed:', error);
          // Clear any local state
          this.userSubject.next(null);
        }
      });
  }
  
  /**
   * Verify if the current token is still valid
   * @returns Observable of the refresh response or error
   */
  verifyToken(): Observable<AuthResponse> {
    // Get the current user to access the token
    const currentUser = this.getCurrentUser();
    
    // If no user or token, we can't refresh
    if (!currentUser || !currentUser.token) {
      console.warn('No authentication token available for refresh');
      return throwError(() => new Error('No authentication token available'));
    }
    
    // Check if token is expired before making network request
    const tokenData = this.parseJwt(currentUser.token);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (tokenData && tokenData.exp && tokenData.exp < currentTime) {
      console.warn('Token is already expired, not attempting refresh');
      // Don't automatically logout - let the user try to login again
      return throwError(() => new Error('Token expired'));
    }
    
    // Log for debugging
    console.log('Attempting to refresh token with:', currentUser.token.substring(0, 10) + '...');
    
    // Create headers with the Authorization token
    const headers = {
      'Authorization': `Bearer ${currentUser.token}`
    };
    
    // Use POST with explicit headers to ensure token is sent properly
    return this.http.post<{success: boolean, message: string, data: {user: AuthResponse, token: string}}>(
      `${this.apiUrl}/refresh`, 
      {}, 
      { 
        headers: headers,
        withCredentials: true 
      }
    ).pipe(
      map(response => {
        // Extract user data and token from the nested response
        const userData = response.data?.user;
        const token = response.data?.token;
        
        // Log successful refresh
        console.log('Token refresh successful:', response);
        
        // Create a properly formatted AuthResponse
        const authResponse: AuthResponse = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          token: token
        };
        
        // Update user data with fresh data from server
        void this.handleAuthentication(authResponse);
        
        return authResponse;
      }),
      catchError(error => {
        // Log the error for debugging
        console.error('Token refresh failed:', error);
        
        // Don't automatically logout on first refresh failure
        // This prevents immediate logout after login
        return throwError(() => error);
      })
    );
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
  
  // parseJwt method is implemented as a private method below
  
  /**
   * Handle successful authentication
   * @param response Authentication response from API
   * @returns Promise that resolves when authentication is fully processed
   */
  private handleAuthentication(response: AuthResponse): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      // Validate the response has the required data
      if (!response || !response.token || !response.id) {
        console.error('Invalid authentication response:', response);
        resolve(false);
        return;
      }
      
      // Log for debugging
      console.log('Processing authentication response:', {
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
        tokenLength: response.token ? response.token.length : 0
      });
      
      try {
        // Create user object from response
        const user: User = {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role,
          token: response.token
        };
        
        // Verify token is valid before proceeding
        if (!user.token) {
          console.error('Token is missing in authentication response');
          resolve(false);
          return;
        }
        
        const tokenData = this.parseJwt(user.token);
        if (!tokenData || !tokenData.exp) {
          console.error('Invalid token format in authentication response');
          resolve(false);
          return;
        }
        
        // Clear any existing user data first
        this.userSubject.next(null);
        
        // Update the user subject with a slight delay to ensure clean state
        setTimeout(() => {
          // Update the user subject
          this.userSubject.next(user);
          
          // No longer storing token in localStorage - using HttpOnly cookies instead
          // The token is already stored in an HttpOnly cookie by the server
          
          // Start the token refresh timer
          this.startRefreshTokenTimer();
          
          // Verify authentication state is properly set
          const isAuth = this.isAuthenticated();
          console.log('Authentication state after processing:', { 
            isAuthenticated: isAuth,
            currentUser: this.userSubject.value ? 'exists' : 'null'
          });
          
          resolve(isAuth);
        }, 50);
      } catch (error) {
        console.error('Error during authentication processing:', error);
        resolve(false);
      }
    });
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
  
  /**
   * Start the token refresh timer to automatically refresh before expiration
   * JWT tokens typically contain an expiration timestamp that we can decode
   */
  private startRefreshTokenTimer(): void {
    // Clear any existing timer
    this.stopRefreshTokenTimer();
    
    const user = this.userSubject.value;
    if (!user || !user.token) return;
    
    // Decode the JWT token to get the expiration time
    const jwtToken = this.parseJwt(user.token);
    if (!jwtToken || !jwtToken.exp) return;
    
    // Calculate time until token expiration (in milliseconds)
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000); // Refresh 1 minute before expiry
    
    // Set a timer to refresh the token before it expires
    if (timeout > 0) {
      this.refreshTokenTimeout = setTimeout(() => {
        void this.verifyToken().subscribe();
      }, timeout);
    } else {
      // Token is already expired or about to expire, refresh immediately
      void this.verifyToken().subscribe();
    }
  }
  
  /**
   * Stop the token refresh timer
   */
  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = null;
    }
  }
  
  /**
   * Parse a JWT token to get its payload
   * @param token JWT token string
   * @returns Decoded token payload or null if invalid
   */
  private parseJwt(token: string): { exp?: number; sub?: string; [key: string]: any } | null {
    try {
      // Split the token and decode the payload (middle part)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  }
}
