import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';

import { HeaderComponent } from './header.component';
import { AuthService } from '../../services/auth.service';

// Mock AuthService
class MockAuthService {
  user = of(null);
  logout = jasmine.createSpy('logout');
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [
        RouterTestingModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  // Test component creation
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test initial state
  it('should initialize with isAuthenticated as false', () => {
    expect(component.isAuthenticated).toBeFalse();
  });

  // Test logout functionality
  it('should call authService.logout when onLogout is called', () => {
    // Use arrow function to avoid unbound-method error
    const logoutFn = (): void => { component.onLogout(); };
    logoutFn();
    // Direct access to avoid unbound-method error
    expect(authService.logout).toHaveBeenCalled();
  });

  // Test toggle sidenav event emission
  it('should emit toggleSidenav event when onToggleSidenav is called', () => {
    // Use arrow function to avoid unbound-method error
    const emitSpy = jasmine.createSpy('emit');
    // Use proper type assertion
    component.toggleSidenav = { emit: emitSpy } as unknown as EventEmitter<void>;
    
    const toggleFn = (): void => { component.onToggleSidenav(); };
    toggleFn();
    expect(emitSpy).toHaveBeenCalled();
  });

  // Test authenticated user display
  it('should display user menu when authenticated', () => {
    // Simply set component properties directly for the test
    component.isAuthenticated = true;
    component.userName = 'Test User';
    
    fixture.detectChanges();
    
    // Check if user menu is displayed (implementation depends on your template)
    // This is a placeholder - adjust based on your actual template structure
    const nativeElement = fixture.nativeElement as HTMLElement;
    const userMenuElement = nativeElement.querySelector('.user-menu');
    expect(userMenuElement).toBeTruthy();
  });
});
