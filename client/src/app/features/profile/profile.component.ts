/**
 * Profile component
 * Handles user profile management
 */
import { Component, OnInit } from '@angular/core';

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
   * Constructor
   */
  constructor() { }
  
  /**
   * Lifecycle hook that is called after component initialization
   */
  ngOnInit(): void {
    // Initialize component
  }
}
