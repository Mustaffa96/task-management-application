/**
 * Error Interceptor
 * Handles HTTP errors globally
 */
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { environment } from '@environments/environment';

/**
 * Error Interceptor
 * Globally handles HTTP errors and provides appropriate responses
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  /**
   * Constructor
   * @param router Angular router
   * @param snackBar Material snackbar for notifications
   * @param authService Authentication service
   */
  constructor(
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly authService: AuthService
  ) {}

  /**
   * Intercept HTTP requests to handle errors
   * @param request The outgoing request
   * @param next The next handler
   * @returns An observable of the HTTP event
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        
        // Extract error message from response
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.statusText) {
            errorMessage = `${error.status}: ${error.statusText}`;
          }
          
          // Handle specific status codes
          switch (error.status) {
            case 401: { // Unauthorized
              // Check if this is an API request and not a refresh token request
              const isApiUrl = request.url.startsWith(environment.apiUrl);
              const isRefreshRequest = request.url.includes('/refresh');
              const isLoginRequest = request.url.includes('/login');
              const isTasksRequest = request.url.includes('/tasks');
              
              console.log('401 Error intercepted:', { 
                url: request.url, 
                isApiUrl, 
                isRefreshRequest,
                isTasksRequest,
                hasUser: !!this.authService.getCurrentUser()
              });
              
              // Don't attempt to refresh token for login requests
              if (isLoginRequest) {
                errorMessage = 'Invalid email or password';
                break;
              }
              
              // For tasks requests, we'll handle them more gracefully
              // The TaskService has special handling for 401 errors
              if (isTasksRequest) {
                console.log('Task request with authentication error, handled by TaskService');
                return throwError(() => error);
              }
              
              if (isApiUrl && !isRefreshRequest && this.authService.getCurrentUser()) {
                console.log('Attempting token refresh before giving up');
                // Try to refresh the token before giving up
                return this.handleUnauthorizedError(request, next);
              } else if (isRefreshRequest) {
                // Only logout if this is a failed refresh request
                console.warn('Token refresh failed, logging out');
                this.authService.logout();
                void this.router.navigate(['/login']);
                errorMessage = 'Session expired. Please log in again.';
              } else if (!this.authService.getCurrentUser()) {
                // User is not logged in, just show error message
                errorMessage = 'Authentication required. Please log in.';
              }
              break;
            }
            
            case 403: { // Forbidden
              void this.router.navigate(['/tasks']);
              errorMessage = 'You do not have permission to access this resource.';
              break;
            }
            
            case 404: { // Not Found
              errorMessage = 'Resource not found.';
              break;
            }
            
            case 500: { // Server Error
              errorMessage = 'Server error. Please try again later.';
              break;
            }
          }
        }
        
        // Show error message to user
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
        
        // Pass the error along
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
  /**
   * Handle 401 Unauthorized errors by attempting to refresh the token
   * @param request The original request that failed
   * @param next The next handler
   * @returns An observable of the HTTP event after token refresh attempt
   */
  private handleUnauthorizedError(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.authService.verifyToken().pipe(
      switchMap(() => {
        // Get the updated token
        const currentUser = this.authService.getCurrentUser();
        
        // Clone the request with the new token
        if (currentUser && currentUser.token) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${currentUser.token}`
            }
          });
        }
        
        // Retry the request with the new token
        return next.handle(request);
      }),
      catchError(error => {
        // If refresh token fails, logout and redirect
        this.authService.logout();
        void this.router.navigate(['/login']);
        
        const errorMessage = 'Session expired. Please log in again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
