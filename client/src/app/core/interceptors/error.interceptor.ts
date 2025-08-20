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
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

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
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
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
            case 401: // Unauthorized
              // Auto logout if 401 response returned from API
              this.authService.logout();
              this.router.navigate(['/login']);
              errorMessage = 'Session expired. Please log in again.';
              break;
              
            case 403: // Forbidden
              this.router.navigate(['/tasks']);
              errorMessage = 'You do not have permission to access this resource.';
              break;
              
            case 404: // Not Found
              errorMessage = 'Resource not found.';
              break;
              
            case 500: // Server Error
              errorMessage = 'Server error. Please try again later.';
              break;
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
}
