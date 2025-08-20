/**
 * Application routing module
 * Defines routes and navigation for the application
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';

// Guards
import { AuthGuard } from './core/guards/auth.guard';

/**
 * Application routes
 */
const routes: Routes = [
  // Default route redirects to tasks
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  
  // Auth routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Lazy-loaded feature modules
  {
    path: 'tasks',
    loadChildren: () => import('./features/tasks/tasks.module').then(m => m.TasksModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },
  
  // Wildcard route for 404
  { path: '**', component: PageNotFoundComponent }
];

/**
 * Application routing module
 */
@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled' // Scroll to top on navigation
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
