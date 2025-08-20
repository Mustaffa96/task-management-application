/**
 * Configuration module for the application
 * Loads environment variables and provides configuration values
 */
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Server configuration object
 * Contains all environment-specific settings
 */
const config = {
  // Server settings
  server: {
    port: process.env.PORT || 8000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  
  // Database settings
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_key_for_development',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  // Cors settings
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
};

export default config;
