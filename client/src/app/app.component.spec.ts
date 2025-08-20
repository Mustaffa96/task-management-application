import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';

// Mock AuthService
class MockAuthService {
  autoLogin = jasmine.createSpy('autoLogin');
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        MatSidenavModule
      ],
      declarations: [AppComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService }
      ],
      // Use NO_ERRORS_SCHEMA to ignore child components
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  // Test component creation
  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  // Test title
  it('should have the correct title', () => {
    expect(component.title).toEqual('Task Management');
  });

  // Test autoLogin is called on init
  it('should call autoLogin on initialization', () => {
    expect(authService.autoLogin).toHaveBeenCalled();
  });

  // Test sidenav toggle
  it('should toggle sidenav when toggleSidenav is called', () => {
    // Initial state should be closed
    expect(component.sidenavOpened).toBeFalse();
    
    // Toggle sidenav
    component.toggleSidenav();
    expect(component.sidenavOpened).toBeTrue();
    
    // Toggle again
    component.toggleSidenav();
    expect(component.sidenavOpened).toBeFalse();
  });

  // Test sidenav close
  it('should close sidenav when closeSidenav is called', () => {
    // First open the sidenav
    component.sidenavOpened = true;
    
    // Call closeSidenav
    component.closeSidenav();
    expect(component.sidenavOpened).toBeFalse();
  });
});
