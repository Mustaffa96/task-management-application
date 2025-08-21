/**
 * Tasks routing module
 * Defines routes for task management features
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { TaskListComponent } from './task-list/task-list.component';
import { MyTasksComponent } from './my-tasks/my-tasks.component';
import { AssignedTasksComponent } from './assigned-tasks/assigned-tasks.component';
import { TaskCreateComponent } from './task-create/task-create.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { TaskEditComponent } from './task-edit/task-edit.component';

/**
 * Routes for tasks feature
 */
const routes: Routes = [
  // Default route shows all tasks
  { path: '', component: TaskListComponent },
  
  // My tasks route
  { path: 'my-tasks', component: MyTasksComponent },
  
  // Assigned tasks route
  { path: 'assigned', component: AssignedTasksComponent },
  
  // Create task route
  { path: 'create', component: TaskCreateComponent },
  
  // Task edit route - must come before the generic :id route
  { path: 'edit/:id', component: TaskEditComponent },
  
  // Task detail route - must come last as it's a catch-all for IDs
  { path: ':id', component: TaskDetailComponent },
];

/**
 * Tasks routing module
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule { }
