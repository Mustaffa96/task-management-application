/**
 * Authentication Guard
 * Protects routes that require authentication
 */
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router, 
  UrlTree 
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Authentication Guard
 * Prevents unauthorized access to protected routes
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  /**
   * Constructor
   * @param authService Authentication service
   * @param router Angular router
   */
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  /**
   * Determines if a route can be activated
   * @param route Route being activated
   * @param state Router state
   * @returns Boolean indicating if route can be activated or a redirect URL
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Check if user is authenticated
    if (this.authService.isAuthenticated()) {
      // Check if route requires specific role
      const requiredRole = route.data['requiredRole'] as string;
      
      if (requiredRole && !this.authService.hasRole(requiredRole)) {
        // User doesn't have required role, redirect to dashboard
        return this.router.createUrlTree(['/tasks']);
      }
      
      // User is authenticated and has required role (if any)
      return true;
    }
    
    // User is not authenticated, redirect to login
    // Store the attempted URL for redirecting after login
    return this.router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
}
