/**
 * Profile component
 * Handles user profile management
 */
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Profile component
 * Main component for user profile management
 */
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  /**
   * Loading state
   */
  isLoading = false;

  /**
   * Current user data
   */
  userData: User | null = null;

  /**
   * Error message if API call fails
   */
  errorMessage: string | null = null;
  
  /**
   * Constructor
   * @param userService Service for user-related API calls
   */
  constructor(private readonly userService: UserService) { }
  
  /**
   * Lifecycle hook that is called after component initialization
   * Fetches user profile data when component initializes
   */
  ngOnInit(): void {
    this.loadUserProfile();
  }

  /**
   * Loads the current user's profile data from the API
   */
  loadUserProfile(): void {
    // Set loading state to true before API call
    this.isLoading = true;
    this.errorMessage = null;

    // Call the user service to get current user data
    this.userService.getProfile()
      .pipe(
        // Handle any errors that occur during the API call
        catchError(error => {
          console.error('Error fetching user profile:', error);
          this.errorMessage = 'Failed to load profile data. Please try again later.';
          return of(null); // Return observable with null to continue the stream
        }),
        // Always set loading to false when done, whether successful or not
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(user => {
        if (user) {
          this.userData = user;
        }
      });
  }
}
