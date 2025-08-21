# Task Management Application

A full-stack task management application built with the MEAN stack (MongoDB, Express.js, Angular, Node.js) using TypeScript. This application follows clean architecture principles and implements SOLID design patterns.

## Recent Updates

- Implemented complete backend API with Express.js and MongoDB
- Created authentication system with JWT tokens via HttpOnly cookies
- Set up comprehensive Swagger API documentation
- Implemented Angular frontend with Material UI components
- Added role-based authorization for different user types
- Created responsive UI with mobile-friendly design
- **Enhanced token refresh mechanism** to prevent automatic logouts
- **Improved CORS configuration** for better cross-origin security
- **Added client-side token validation** to reduce unnecessary API calls
- **Fixed authentication persistence** across browser sessions
- **Fixed login response handling** to properly process nested API responses
- **Fixed task service API response handling** to correctly process nested data structure from backend
- **Fixed backend route for assigned tasks** to properly handle `/api/tasks/assigned` endpoint and prevent CastError with ObjectId
- **Implemented complete API fetch methods** for `/tasks/my-tasks`, `/tasks/assigned`, `/tasks/create`, and `/users/profile` endpoints
- **Added new task management components** for My Tasks, Assigned Tasks, and Task Creation with responsive UI
- **Implemented full task management functionality** with task detail view, edit capabilities, and delete operations
- **Fixed task-detail component TypeScript errors** by removing unnecessary optional chaining operators and adding helper methods for proper type handling
- **Fixed task edit and delete functionality** by correcting the routing order in tasks-routing.module.ts to ensure specific routes like 'edit/:id' come before generic ':id' routes

## Features

- **User Authentication**: Secure login, registration, and token refresh functionality with JWT
- **Task Management**: Create, read, update, and delete tasks with proper authorization
- **Task Assignment**: Assign tasks to different users with email notifications
- **Task Filtering**: Filter tasks by status, priority, assignee, creator, and due dates
- **Role-Based Access Control**: Different permissions for regular users and administrators
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **API Documentation**: Comprehensive Swagger documentation for all endpoints

## Technology Stack

### Backend
- **Node.js** with **Express.js** framework
- **TypeScript** for type safety and better developer experience
- **MongoDB** with Mongoose for database operations
- **JWT** for secure authentication with HttpOnly cookies
- **Clean Architecture** with use cases, controllers, and entities
- **Swagger** for API documentation
- **Error Handling Middleware** for consistent error responses

### Frontend
- **Angular** with TypeScript
- **Angular Material** for UI components and consistent design
- **RxJS** for reactive state management and HTTP requests
- **Feature Modules** with lazy loading for better performance
- **Route Guards** for protecting authenticated routes
- **HTTP Interceptors** for handling auth tokens and errors
- **Responsive Design** with mobile-first approach
- **Consistent API Services** with standardized error handling and response processing
- **Task Management Components**:
  - **My Tasks**: View and manage tasks created by the current user
  - **Assigned Tasks**: View and update tasks assigned to the current user
  - **Task Creation**: Form with validation for creating new tasks
  - **Task Detail**: View detailed information about a specific task with options to edit or delete
  - **Task Edit**: Form with validation for updating existing tasks and reassigning to different users
  - **Task List**: Enhanced with view, edit, and delete actions for each task

### DevOps
- **GitHub Actions** for CI/CD
- **pnpm** for package management

## Project Structure

```
├── client/                      # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/            # Core modules, services, and models
│   │   │   │   ├── components/  # Core components (header, footer, etc.)
│   │   │   │   ├── guards/      # Route guards for authentication
│   │   │   │   ├── interceptors/# HTTP interceptors
│   │   │   │   ├── models/      # Data models and interfaces
│   │   │   │   └── services/    # Core services (auth, error handling)
│   │   │   ├── features/        # Feature modules
│   │   │   │   ├── auth/        # Authentication components
│   │   │   │   ├── tasks/       # Task management components
│   │   │   │   └── profile/     # User profile components
│   │   │   └── shared/          # Shared components and directives
│   │   └── environments/        # Environment configuration
│   └── ...
├── server/                      # Node.js backend application
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   ├── controllers/        # API controllers
│   │   ├── entities/           # Domain entities
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes
│   │   ├── use-cases/          # Business logic use cases
│   │   └── index.ts            # Application entry point
│   └── ...
└── .github/                    # GitHub Actions workflows
    └── workflows/              # CI/CD pipeline configurations
```

## API Services

The application implements standardized API services with consistent error handling and response processing:

### Task Service

- **getTasks(filter?)**: Fetches all tasks with optional filtering by status, priority, assignee, etc.
- **getMyTasks()**: Retrieves tasks created by the current user via `/api/tasks/my-tasks`
- **getAssignedTasks()**: Retrieves tasks assigned to the current user via `/api/tasks/assigned`
- **getTask(id)**: Gets a single task by ID with detailed information
- **createTask(task)**: Creates a new task with proper validation
- **updateTask(id, task)**: Updates an existing task with authorization checks
- **deleteTask(id)**: Deletes a task with proper authorization and confirmation

### User Service

- **getProfile()**: Fetches the current user's profile via `/api/users/profile`
- **getUsers()**: Retrieves all users (admin only)
- **getUser(id)**: Gets a specific user by ID
- **updateProfile(userData)**: Updates the current user's profile
- **updateUser(id, userData)**: Updates a specific user (admin only)
- **deleteUser(id)**: Deletes a user (admin only)

All API services feature:
- Consistent response structure handling
- Comprehensive error handling with appropriate fallbacks
- Special handling for authentication errors (401)
- Proper date transformation for task dates
- Detailed console logging for debugging
- Type safety with TypeScript interfaces

## Security Features

- **JWT Authentication**: Secure token-based authentication with both cookie and header support
- **HttpOnly Cookies**: Prevents client-side JavaScript from accessing tokens
- **Advanced Token Refresh**: Proactive token refresh before expiration to prevent session timeouts
- **Token Expiration Handling**: Intelligent handling of expired tokens with automatic refresh attempts
- **Client-side Token Validation**: Checks token expiration before making unnecessary API calls
- **Role-Based Authorization**: Different permissions for users and admins
- **Input Validation**: Server-side validation of all inputs
- **Error Handling**: Centralized error handling with appropriate status codes
- **CORS Protection**: Configured for secure cross-origin requests with credentials support
- **Password Hashing**: Secure password storage with bcrypt
- **Dual Authentication Strategy**: Supports both cookie-based and header-based token authentication
- **Graceful Session Recovery**: Attempts to recover user sessions when possible

## Getting Started

### Prerequisites

- Node.js (v16+)
- pnpm (v7+)
- MongoDB (local or Atlas cloud instance)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/task-management-application.git
   cd task-management-application
   ```

2. Install dependencies for both client and server
   ```bash
   # Install server dependencies
   cd server
   pnpm install
   
   # Install client dependencies
   cd ../client
   pnpm install
   ```

3. Set up environment variables
   ```bash
   # In the server directory
   cp .env.example .env
   # Edit .env with your MongoDB connection string and JWT secret
   ```
   
   Required environment variables:
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT (use a strong random string, at least 32 characters)
   - `JWT_EXPIRES_IN`: Token expiration time (default: 7d)
   - `PORT`: Server port (default: 8000)
   - `NODE_ENV`: Environment (development, production, test)

4. Start the development servers
   ```bash
   # Start the backend server
   cd server
   pnpm dev
   
   # In another terminal, start the frontend server
   cd client
   pnpm start
   ```

5. Seed the database with test data (optional)
   ```bash
   # In the server directory
   cd server
   pnpm seed
   ```
   
   This will populate your database with:
   - Sample users (admin and regular users)
   - Sample tasks with various statuses and priorities
   - Default password for all seeded users is `password123`

6. Open your browser and navigate to `http://localhost:4200`

   The backend API will be available at `http://localhost:8000/api` with these endpoints:
   - Authentication: `http://localhost:8000/api/auth`
   - Users: `http://localhost:8000/api/users`
   - Tasks: `http://localhost:8000/api/tasks`
   
   Swagger documentation is available at `http://localhost:8000/api-docs`

## Testing

```bash
# Run backend tests
cd server
pnpm test

# Run frontend tests
cd client
pnpm test
```

The application includes:
- Unit tests for backend use cases and controllers
- Integration tests for API endpoints
- Unit tests for Angular components and services
- End-to-end tests for critical user flows

## Deployment

The application is configured with GitHub Actions for CI/CD. Push to the main branch will trigger:

1. Linting and testing for both frontend and backend
2. Building the application for production
3. Deployment to the hosting platform

Separate workflows are configured for:
- Backend CI/CD (`backend-ci.yml`)
- Frontend CI/CD (`frontend-ci.yml`)
- Combined deployment (`deploy.yml`)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow the established project structure
- Write clean, commented code following SOLID principles
- Include appropriate tests for new features
- Update documentation for API changes
- Ensure all linting checks pass before submitting

## License

This project is licensed under the MIT License - see the LICENSE file for details.
