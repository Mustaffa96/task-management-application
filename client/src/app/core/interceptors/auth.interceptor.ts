/**
 * Authentication Interceptor
 * Adds authentication headers to outgoing requests
 */
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '@environments/environment';

/**
 * Authentication Interceptor
 * Automatically adds authentication token to API requests
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  /**
   * Constructor
   * @param authService Authentication service
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Intercept HTTP requests
   * @param request The outgoing request
   * @param next The next handler
   * @returns An observable of the HTTP event
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get current user
    const currentUser = this.authService.getCurrentUser();
    const isApiUrl = request.url.startsWith(environment.apiUrl);
    
    // Only add token for API requests and if user is authenticated with a token
    // Note: Our backend uses HttpOnly cookies for JWT, but this is here in case
    // we need to switch to Authorization header approach
    if (isApiUrl && currentUser && currentUser.token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
    }
    
    // Always include credentials for API requests to allow cookies
    if (isApiUrl) {
      request = request.clone({
        withCredentials: true
      });
    }
    
    return next.handle(request);
  }
}
