import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FooterComponent],
      imports: [
        RouterTestingModule,
        MatToolbarModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test component creation
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test current year property
  it('should have currentYear property set to current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear).toBe(currentYear);
  });

  // Test footer links display
  it('should display footer links', () => {
    const footerElement: HTMLElement = fixture.nativeElement;
    const links = footerElement.querySelectorAll('a');
    
    // Check if we have at least 3 links (Privacy, Terms, Contact)
    expect(links.length).toBeGreaterThanOrEqual(3);
    
    // Check if copyright text is displayed
    const copyrightText = footerElement.textContent;
    expect(copyrightText).toContain('© ' + component.currentYear);
  });
});
