/**
 * User Service
 * Handles API communication for user management
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = `${environment.apiUrl}/users`;
  
  /**
   * Constructor
   * @param http HttpClient for API requests
   */
  constructor(private http: HttpClient) {}
  
  /**
   * Get all users (admin only)
   * @returns Observable of user array
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
  
  /**
   * Get current user profile
   * @returns Observable of current user
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }
  
  /**
   * Get user by ID
   * @param id User ID
   * @returns Observable of user
   */
  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }
  
  /**
   * Update current user profile
   * @param userData User update data
   * @returns Observable of updated user
   */
  updateProfile(userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, userData);
  }
  
  /**
   * Update user by ID (admin only)
   * @param id User ID
   * @param userData User update data
   * @returns Observable of updated user
   */
  updateUser(id: string, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }
  
  /**
   * Delete user by ID (admin only)
   * @param id User ID
   * @returns Observable of deletion result
   */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
