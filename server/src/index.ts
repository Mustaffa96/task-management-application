/**
 * Main application entry point
 * Initializes Express server with middleware and routes
 */
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import configuration
import config from './config/config';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import taskRoutes from './routes/task.routes';

// Import middleware
import { notFound, errorHandler } from './middleware/error.middleware';

// Import swagger documentation
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

/**
 * Express application setup
 */
const app: Application = express();
const PORT: number = parseInt(config.server.port as string, 10);

/**
 * Middleware setup
 */
// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors(config.cors)); // Enable CORS

// Request parsing
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// Logging middleware
app.use(morgan('dev')); // Log HTTP requests

/**
 * Swagger documentation setup
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

/**
 * Root endpoint
 */
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to Task Management API',
    documentation: `http://localhost:${PORT}/api-docs`,
  });
});

/**
 * Error handling middleware
 */
// 404 handler for routes that don't exist
app.use(notFound);

// Global error handler
app.use(errorHandler);

/**
 * Start server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server running in ${config.server.nodeEnv} mode on port ${PORT}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
