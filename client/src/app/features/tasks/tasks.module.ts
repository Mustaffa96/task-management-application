/**
 * Tasks module
 * Handles task management functionality
 */
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Routing
import { TasksRoutingModule } from './tasks-routing.module';

// Components
import { TaskListComponent } from './task-list/task-list.component';
import { MyTasksComponent } from './my-tasks/my-tasks.component';
import { AssignedTasksComponent } from './assigned-tasks/assigned-tasks.component';
import { TaskCreateComponent } from './task-create/task-create.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { TaskEditComponent } from './task-edit/task-edit.component';


/**
 * Tasks feature module
 */
@NgModule({
  declarations: [
    TaskListComponent,
    MyTasksComponent,
    AssignedTasksComponent,
    TaskCreateComponent,
    TaskDetailComponent,
    TaskEditComponent
  ],
  providers: [
    DatePipe,
    TitleCasePipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TasksRoutingModule,
    // Material modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatDialogModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatSnackBarModule
  ]
})
export class TasksModule { }
