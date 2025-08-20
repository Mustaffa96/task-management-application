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
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}
  
  /**
   * Lifecycle hook that is called after component initialization
   * Initializes the login form and gets return URL
   */
  ngOnInit(): void {
    // Initialize login form with validation
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    // Get return URL from route parameters or default to '/tasks'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/tasks';
    
    // If user is already authenticated, redirect to return URL
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
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
        // Login successful
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Redirect to return URL
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        // Login failed - error is handled by error interceptor
        this.isLoading = false;
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
