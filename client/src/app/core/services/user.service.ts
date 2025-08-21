/**
 * User Service
 * Handles API communication for user management
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '../models/user.model';

/**
 * User profile update request
 */
export interface UpdateUserRequest {
  /**
   * User name
   */
  name?: string;
  
  /**
   * User email
   */
  email?: string;
  
  /**
   * Current password (required for updates)
   */
  currentPassword?: string;
  
  /**
   * New password
   */
  newPassword?: string;
}

/**
 * User Service
 * Provides methods for interacting with the user API
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  /**
   * API URL for user endpoints
   */
  private readonly apiUrl = `${environment.apiUrl}/users`;
  
  /**
   * Constructor
   * @param http HttpClient for API requests
   */
  constructor(private readonly http: HttpClient) {}
  
  /**
   * Get all users (admin only)
   * @returns Observable of user array or empty array if error occurs
   */
  getUsers(): Observable<User[]> {
    console.log('Fetching all users');
    return this.http.get<{success: boolean, message: string, data: User[]}>(`${this.apiUrl}`).pipe(
      map(response => {
        console.log('Users fetched successfully:', response.data?.length || 0);
        return response.data || [];
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching users:', error);
        return of([]);
      })
    );
  }
  
  /**
   * Get current user profile
   * @returns Observable of current user or null if error occurs
   */
  getProfile(): Observable<User | null> {
    console.log('Fetching user profile');
    return this.http.get<{success: boolean, message: string, data: User}>(`${this.apiUrl}/profile`).pipe(
      map(response => {
        console.log('Profile fetched successfully');
        return response.data;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching profile:', error);
        
        // Special handling for authentication errors
        if (error.status === 401) {
          console.warn('Authentication error when fetching profile. Token may be invalid or expired.');
        }
        
        return of(null);
      })
    );
  }
  
  /**
   * Get user by ID
   * @param id User ID
   * @returns Observable of user or null if error occurs
   */
  getUser(id: string): Observable<User | null> {
    console.log(`Fetching user with ID: ${id}`);
    return this.http.get<{success: boolean, message: string, data: User}>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        console.log('User fetched successfully');
        return response.data;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Error fetching user ${id}:`, error);
        return of(null);
      })
    );
  }
  
  /**
   * Update current user profile
   * @param userData User update data
   * @returns Observable of updated user or null if error occurs
   */
  updateProfile(userData: UpdateUserRequest): Observable<User | null> {
    console.log('Updating user profile');
    return this.http.put<{success: boolean, message: string, data: User}>(`${this.apiUrl}/profile`, userData).pipe(
      map(response => {
        console.log('Profile updated successfully');
        return response.data;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error updating profile:', error);
        return of(null);
      })
    );
  }
  
  /**
   * Update user by ID (admin only)
   * @param id User ID
   * @param userData User update data
   * @returns Observable of updated user or null if error occurs
   */
  updateUser(id: string, userData: UpdateUserRequest): Observable<User | null> {
    console.log(`Updating user ${id}`);
    return this.http.put<{success: boolean, message: string, data: User}>(`${this.apiUrl}/${id}`, userData).pipe(
      map(response => {
        console.log(`User ${id} updated successfully`);
        return response.data;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Error updating user ${id}:`, error);
        return of(null);
      })
    );
  }
  
  /**
   * Delete user by ID (admin only)
   * @param id User ID
   * @returns Observable of deletion result (true if successful, false otherwise)
   */
  deleteUser(id: string): Observable<boolean> {
    console.log(`Deleting user ${id}`);
    return this.http.delete<{success: boolean, message: string}>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        console.log(`User ${id} deleted successfully`);
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Error deleting user ${id}:`, error);
        return of(false);
      })
    );
  }
}
