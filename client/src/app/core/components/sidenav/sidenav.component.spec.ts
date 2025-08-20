import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { SidenavComponent } from './sidenav.component';
import { AuthService } from '../../services/auth.service';

// Mock AuthService
class MockAuthService {
  user = of(null);
}

describe('SidenavComponent', () => {
  let component: SidenavComponent;
  let fixture: ComponentFixture<SidenavComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidenavComponent],
      imports: [
        RouterTestingModule,
        MatListModule,
        MatIconModule,
        MatSidenavModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidenavComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  // Test component creation
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test authentication state
  it('should initialize with isAuthenticated as false', () => {
    expect(component.isAuthenticated).toBeFalse();
  });

  // Test authenticated state
  it('should update user information when authenticated', () => {
    // Override the mock to return authenticated state
    (authService.user as any) = of({ name: 'Test User', email: 'test@example.com' });
    
    // Trigger ngOnInit again
    component.ngOnInit();
    
    expect(component.isAuthenticated).toBeTrue();
    expect(component.userName).toBe('Test User');
    expect(component.userEmail).toBe('test@example.com');
  });

  // Test cleanup on destroy
  it('should unsubscribe on component destroy', () => {
    const unsubscribeSpy = spyOn<any>(component['authSubscription'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
