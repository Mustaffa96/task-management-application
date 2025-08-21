/**
 * Login component
 * Handles user authentication
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '@core/services/auth.service';
import { LoginRequest } from '@core/models/auth.model';

/**
 * Login component
 * Provides user login functionality
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  /**
   * Login form
   */
  loginForm!: FormGroup;
  
  /**
   * Loading state
   */
  isLoading = false;
  
  /**
   * Hide password flag
   */
  hidePassword = true;
  
  /**
   * Return URL for redirect after login
   */
  private returnUrl = '/tasks';
  
  /**
   * Constructor
   * @param formBuilder Form builder service
   * @param authService Authentication service
   * @param router Angular router
   * @param route Activated route
   * @param snackBar Material snackbar
   */
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snackBar: MatSnackBar
  ) {}
  
  /**
   * Lifecycle hook that is called after component initialization
   * Initializes the login form and gets return URL
   */
  ngOnInit(): void {
    // Initialize login form with validation
    // Use arrow functions to avoid unbound-method errors
    const requiredValidator = () => Validators.required;
    const emailValidator = () => Validators.email;
    const minLengthValidator = (length: number) => Validators.minLength(length);
    
    this.loginForm = this.formBuilder.group({
      email: ['', [requiredValidator(), emailValidator()]],
      password: ['', [requiredValidator(), minLengthValidator(6)]]
    });
    
    // Get return URL from route parameters or default to '/tasks'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/tasks';
    
    // If user is already authenticated, redirect to return URL
    if (this.authService.isAuthenticated()) {
      void this.router.navigate([this.returnUrl]);
    }
  }
  
  /**
   * Handle form submission
   * Attempts to log in the user with provided credentials
   */
  onSubmit(): void {
    // Check if form is valid
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }
    
    // Set loading state
    this.isLoading = true;
    
    // Get form values
    const loginData: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };
    
    // Attempt login
    this.authService.login(loginData).subscribe({
      next: (response) => {
        // Login successful - API call worked
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Give the auth service a moment to update the authentication state
        setTimeout(() => {
          // Check authentication state after a small delay
          const isAuthenticated = this.authService.isAuthenticated();
          const currentUser = this.authService.getCurrentUser();
          
          // Log authentication state for debugging
          console.log('Authentication state after login (with delay):', {
            authSuccess: response.authSuccess,
            isAuthenticated: isAuthenticated,
            hasUser: !!currentUser,
            returnUrl: this.returnUrl
          });
          
          if (isAuthenticated && currentUser) {
            // Authentication was successful, navigate to tasks
            console.log('Authentication confirmed, navigating to:', this.returnUrl);
            
            // Redirect to return URL
            void this.router.navigate([this.returnUrl])
              .then(success => {
                console.log('Navigation result:', success ? 'successful' : 'failed');
                if (!success) {
                  // If navigation fails, try navigating to the root tasks route
                  void this.router.navigate(['/tasks'])
                    .then(fallbackSuccess => {
                      console.log('Fallback navigation result:', fallbackSuccess ? 'successful' : 'failed');
                      if (!fallbackSuccess) {
                        // If all navigation attempts fail, show error
                        this.snackBar.open('Navigation failed. Please try again.', 'Close', {
                          duration: 5000,
                          panelClass: ['error-snackbar']
                        });
                      }
                    });
                }
              });
          } else {
            // Authentication failed despite successful API response
            console.error('Authentication state not properly set after login');
            this.snackBar.open('Login successful but session setup failed. Please try again.', 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isLoading = false;
          }
        }, 200); // Give auth service time to update state
      },
      error: (error) => {
        // Login failed - show error message
        console.error('Login error:', error);
        this.isLoading = false;
        this.snackBar.open(error.error?.message || 'Login failed. Please check your credentials.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Get form control error message
   * @param controlName Name of the form control
   * @returns Error message string
   */
  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    
    if (control?.hasError('required')) {
      return `${this.getFieldName(controlName)} is required`;
    }
    
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Password must be at least ${minLength} characters long`;
    }
    
    return '';
  }
  
  /**
   * Check if form control has error and is touched
   * @param controlName Name of the form control
   * @returns Boolean indicating if control has error
   */
  hasError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }
  
  /**
   * Get user-friendly field name
   * @param controlName Name of the form control
   * @returns User-friendly field name
   */
  private getFieldName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
      email: 'Email',
      password: 'Password'
    };
    
    return fieldNames[controlName] || controlName;
  }
  
  /**
   * Mark all form controls as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
