/**
 * Sidenav component
 * Side navigation menu for the application
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

/**
 * Sidenav component
 * Contains navigation links and user information
 */
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit, OnDestroy {
  /**
   * Flag to track if user is authenticated
   */
  isAuthenticated = false;
  
  /**
   * User's name for display
   */
  userName = '';
  
  /**
   * User's email for display
   */
  userEmail = '';
  
  /**
   * Subscription to auth state changes
   */
  private authSubscription!: Subscription;
  
  /**
   * Constructor
   * @param authService Authentication service
   */
  constructor(private authService: AuthService) {}
  
  /**
   * Lifecycle hook that is called after component initialization
   * Subscribes to authentication state changes
   */
  ngOnInit(): void {
    this.authSubscription = this.authService.user.subscribe(user => {
      // Update authentication state
      this.isAuthenticated = !!user;
      
      // Update user information if authenticated
      if (user) {
        this.userName = user.name;
        this.userEmail = user.email;
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
}
