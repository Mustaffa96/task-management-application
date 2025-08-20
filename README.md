# Task Management Application

A full-stack task management application built with the MEAN stack (MongoDB, Express.js, Angular, Node.js) using TypeScript. This application follows clean architecture principles and implements SOLID design patterns.

## Recent Updates

- Implemented complete backend API with Express.js and MongoDB
- Created authentication system with JWT tokens via HttpOnly cookies
- Set up comprehensive Swagger API documentation
- Implemented Angular frontend with Material UI components
- Added role-based authorization for different user types
- Created responsive UI with mobile-friendly design

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

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **HttpOnly Cookies**: Prevents client-side JavaScript from accessing tokens
- **Token Refresh**: Automatic refresh of expired tokens
- **Role-Based Authorization**: Different permissions for users and admins
- **Input Validation**: Server-side validation of all inputs
- **Error Handling**: Centralized error handling with appropriate status codes
- **CORS Protection**: Configured for secure cross-origin requests
- **Password Hashing**: Secure password storage with bcrypt

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

5. Open your browser and navigate to `http://localhost:4200`

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
