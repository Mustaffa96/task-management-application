/**
 * Main application component
 * Root component that hosts all other components
 */
import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';

/**
 * App component
 * Root component of the application
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  /**
   * Title of the application
   */
  title = 'Task Management';
  
  /**
   * Flag to track if sidenav should be opened
   */
  sidenavOpened = false;
  
  /**
   * Constructor
   * @param authService Authentication service
   */
  constructor(private authService: AuthService) {}
  
  /**
   * Lifecycle hook that is called after component initialization
   * Attempts to auto-login the user if a valid token exists
   */
  ngOnInit(): void {
    // Try to auto-login with stored token
    this.authService.autoLogin();
  }
  
  /**
   * Toggle sidenav open/closed state
   */
  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  /**
   * Close sidenav
   */
  closeSidenav(): void {
    this.sidenavOpened = false;
  }
}
