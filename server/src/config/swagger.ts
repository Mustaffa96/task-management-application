/**
 * Swagger configuration
 * Sets up OpenAPI documentation for the API
 */
import swaggerJsDoc from 'swagger-jsdoc';
import config from './config';

/**
 * Swagger definition options
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',  // Using OpenAPI 3.0.0 specification
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'API documentation for Task Management Application',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      contact: {
        name: 'API Support',
        email: 'support@taskmanagement.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}/api`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your bearer token in the format "Bearer {token}". Token must be obtained from the /api/auth/login endpoint. Sample tokens will not work.',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Task: {
          type: 'object',
          required: ['title', 'description'],
          properties: {
            id: {
              type: 'string',
              description: 'Task ID',
            },
            title: {
              type: 'string',
              description: 'Task title',
            },
            description: {
              type: 'string',
              description: 'Task description',
            },
            status: {
              type: 'string',
              enum: ['todo', 'in-progress', 'done'],
              description: 'Task status',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Task priority',
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Task due date',
            },
            assigneeId: {
              type: 'string',
              description: 'ID of the user assigned to the task',
            },
            createdBy: {
              type: 'string',
              description: 'ID of the user who created the task',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            message: {
              type: 'string',
              description: 'Error details',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Login successful'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid'
        },
        NotFoundError: {
          description: 'The requested resource was not found'
        },
        BadRequestError: {
          description: 'Invalid request parameters'
        },
        ForbiddenError: {
          description: 'User does not have permission to access the resource'
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'API endpoints for user authentication',
      },
      {
        name: 'Users',
        description: 'API endpoints for user management',
      },
      {
        name: 'Tasks',
        description: 'API endpoints for task management',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/models/*.ts'],
};

/**
 * Generate Swagger specification
 */
const swaggerSpec = swaggerJsDoc(swaggerOptions);

export default swaggerSpec;
