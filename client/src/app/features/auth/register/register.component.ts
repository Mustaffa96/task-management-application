/**
 * Register component
 * Handles user registration
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '@core/services/auth.service';
import { RegisterRequest } from '@core/models/auth.model';

/**
 * Register component
 * Provides user registration functionality
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  /**
   * Registration form
   */
  registerForm!: FormGroup;
  
  /**
   * Loading state
   */
  isLoading = false;
  
  /**
   * Hide password flag
   */
  hidePassword = true;
  
  /**
   * Hide confirm password flag
   */
  hideConfirmPassword = true;
  
  /**
   * Constructor
   * @param formBuilder Form builder service
   * @param authService Authentication service
   * @param router Angular router
   * @param snackBar Material snackbar
   */
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  /**
   * Lifecycle hook that is called after component initialization
   * Initializes the registration form
   */
  ngOnInit(): void {
    // Initialize registration form with validation
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
    
    // If user is already authenticated, redirect to tasks
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/tasks']);
    }
  }
  
  /**
   * Handle form submission
   * Attempts to register the user with provided data
   */
  onSubmit(): void {
    // Check if form is valid
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }
    
    // Set loading state
    this.isLoading = true;
    
    // Get form values
    const registerData: RegisterRequest = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };
    
    // Attempt registration
    this.authService.register(registerData).subscribe({
      next: (response) => {
        // Registration successful
        this.snackBar.open('Registration successful! Welcome to Task Management!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Redirect to tasks
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        // Registration failed - error is handled by error interceptor
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Custom validator to check if passwords match
   * @param control Form group control
   * @returns Validation error or null
   */
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }
  
  /**
   * Get form control error message
   * @param controlName Name of the form control
   * @returns Error message string
   */
  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    
    if (control?.hasError('required')) {
      return `${this.getFieldName(controlName)} is required`;
    }
    
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.getFieldName(controlName)} must be at least ${minLength} characters long`;
    }
    
    if (controlName === 'confirmPassword' && this.registerForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    
    return '';
  }
  
  /**
   * Check if form control has error and is touched
   * @param controlName Name of the form control
   * @returns Boolean indicating if control has error
   */
  hasError(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    const hasControlError = !!(control?.invalid && (control?.dirty || control?.touched));
    
    // Special case for confirm password - also check form-level password mismatch error
    if (controlName === 'confirmPassword') {
      const hasPasswordMismatch = !!(this.registerForm.hasError('passwordMismatch') && 
                                  (control?.dirty || control?.touched));
      return hasControlError || hasPasswordMismatch;
    }
    
    return hasControlError;
  }
  
  /**
   * Get user-friendly field name
   * @param controlName Name of the form control
   * @returns User-friendly field name
   */
  private getFieldName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
      name: 'Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password'
    };
    
    return fieldNames[controlName] || controlName;
  }
  
  /**
   * Mark all form controls as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}
