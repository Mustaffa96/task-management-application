/**
 * Footer component
 * Application footer with copyright and links
 */
import { Component } from '@angular/core';

/**
 * Footer component
 * Contains copyright information and links
 */
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  /**
   * Current year for copyright
   */
  currentYear = new Date().getFullYear();
}
