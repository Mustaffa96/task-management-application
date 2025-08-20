/**
 * Header component
 * Main navigation header for the application
 */
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

/**
 * Header component
 * Contains the main navigation and user controls
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  /**
   * Event emitter for toggling the sidenav
   */
  @Output() toggleSidenav = new EventEmitter<void>();
  
  /**
   * Flag to track if user is authenticated
   */
  isAuthenticated = false;
  
  /**
   * User's name for display
   */
  userName = '';
  
  /**
   * Subscription to auth state changes
   */
  private authSubscription!: Subscription;
  
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
   * Lifecycle hook that is called after component initialization
   * Subscribes to authentication state changes
   */
  ngOnInit(): void {
    this.authSubscription = this.authService.user.subscribe(user => {
      // Update authentication state
      this.isAuthenticated = !!user;
      
      // Update user name if authenticated
      if (user) {
        this.userName = user.name;
      }
    });
  }
  
  /**
   * Lifecycle hook that is called when component is destroyed
   * Cleans up subscriptions to prevent memory leaks
   */
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
  
  /**
   * Emit event to toggle sidenav
   */
  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }
  
  /**
   * Handle user logout
   */
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
