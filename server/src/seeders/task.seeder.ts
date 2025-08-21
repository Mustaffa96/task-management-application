/**
 * Task seeder file
 * Creates sample tasks for testing and development purposes
 */

import { TaskStatus, TaskPriority, ITask } from '../entities/task.entity';
import { User, IUser } from '../entities/user.entity';
import { TaskRepository } from '../repositories/task.repository';

/**
 * Generate a random date within the specified range
 * @param start Start date for the range
 * @param end End date for the range
 * @returns Random date within the range
 */
const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Generate sample task data based on available users
 * @param users List of users to assign tasks to and create tasks for
 * @returns Array of task data objects
 */
const generateTaskSeedData = (users: IUser[]): Omit<ITask, 'id' | 'createdAt' | 'updatedAt'>[] => {
  // Ensure we have users to work with
  if (!users.length) {
    throw new Error('No users available for task assignment');
  }

  // Get user IDs for task creation and assignment
  const userIds = users.map(user => user.id as string);
  const adminId = users.find(user => user.email === 'admin@example.com')?.id as string;
  
  // Current date for reference
  const now = new Date();
  
  // Generate dates within reasonable ranges
  const pastDate = new Date(now);
  pastDate.setDate(pastDate.getDate() - 30); // 30 days ago
  
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + 30); // 30 days in future

  // Sample task data with varied statuses, priorities, and assignments
  return [
    {
      title: 'Complete project setup',
      description: 'Initialize the project repository and set up basic structure',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: getRandomDate(pastDate, now),
      assigneeId: userIds[0],
      createdBy: adminId || userIds[0],
    },
    {
      title: 'Design database schema',
      description: 'Create entity relationship diagrams and define data models',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: getRandomDate(pastDate, now),
      assigneeId: userIds[1 % userIds.length],
      createdBy: adminId || userIds[0],
    },
    {
      title: 'Implement user authentication',
      description: 'Create login, registration, and password reset functionality',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: getRandomDate(now, futureDate),
      assigneeId: userIds[2 % userIds.length],
      createdBy: adminId || userIds[0],
    },
    {
      title: 'Create task management API',
      description: 'Implement CRUD operations for tasks',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: getRandomDate(now, futureDate),
      assigneeId: userIds[0],
      createdBy: adminId || userIds[0],
    },
    {
      title: 'Design UI components',
      description: 'Create reusable UI components for the frontend',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: getRandomDate(now, futureDate),
      assigneeId: userIds[1 % userIds.length],
      createdBy: adminId || userIds[0],
    },
    {
      title: 'Implement task filtering',
      description: 'Add ability to filter tasks by status, priority, and assignee',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: getRandomDate(now, futureDate),
      assigneeId: userIds[2 % userIds.length],
      createdBy: adminId || userIds[0],
    },
    {
      title: 'Write unit tests',
      description: 'Create comprehensive test suite for backend functionality',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: getRandomDate(now, futureDate),
      assigneeId: undefined, // Unassigned task
      createdBy: adminId || userIds[0],
    },
    {
      title: 'Setup CI/CD pipeline',
      description: 'Configure automated testing and deployment workflows',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: getRandomDate(now, futureDate),
      assigneeId: undefined, // Unassigned task
      createdBy: adminId || userIds[0],
    },
    {
      title: 'Document API endpoints',
      description: 'Create comprehensive API documentation with Swagger',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: getRandomDate(now, futureDate),
      assigneeId: userIds[0],
      createdBy: adminId || userIds[0],
    },
    {
      title: 'Perform security audit',
      description: 'Review code for security vulnerabilities and implement fixes',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: getRandomDate(now, futureDate),
      assigneeId: userIds[1 % userIds.length],
      createdBy: adminId || userIds[0],
    },
  ];
};

/**
 * Seeds the database with sample tasks
 * @param users List of users to assign tasks to and create tasks for
 * @returns Array of created task objects
 */
export const seedTasks = async (users: IUser[]): Promise<ITask[]> => {
  const taskRepository = new TaskRepository();
  const createdTasks: ITask[] = [];

  // Generate task data based on available users
  const taskSeedData = generateTaskSeedData(users);

  // Process each task in the seed data
  for (const taskData of taskSeedData) {
    try {
      // Create new task with the seed data
      // Save task to database directly using the repository
      // The repository will handle validation internally
      const savedTask = await taskRepository.create(taskData as ITask);
      createdTasks.push(savedTask);
      console.log(`Created task: ${savedTask.title}`);
    } catch (error) {
      console.error(`Failed to create task ${taskData.title}:`, error);
    }
  }

  return createdTasks;
};
