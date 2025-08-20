/**
 * Logger utility
 * Provides consistent logging functionality across the application
 */

/**
 * Log levels
 */
enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

/**
 * Logger class for consistent logging
 */
class Logger {
  /**
   * Log an informational message
   * @param message - The message to log
   * @param meta - Optional metadata to include
   */
  public info(message: string, meta?: unknown): void {
    this.log(LogLevel.INFO, message, meta);
  }

  /**
   * Log a warning message
   * @param message - The message to log
   * @param meta - Optional metadata to include
   */
  public warn(message: string, meta?: unknown): void {
    this.log(LogLevel.WARN, message, meta);
  }

  /**
   * Log an error message
   * @param message - The message to log
   * @param meta - Optional metadata to include
   */
  public error(message: string, meta?: unknown): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  /**
   * Log a debug message
   * @param message - The message to log
   * @param meta - Optional metadata to include
   */
  public debug(message: string, meta?: unknown): void {
    // Only log debug messages in development mode
    if (process.env.NODE_ENV !== 'production') {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }

  /**
   * Internal log method
   * @param level - The log level
   * @param message - The message to log
   * @param meta - Optional metadata to include
   */
  private log(level: LogLevel, message: string, meta?: unknown): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;
    const metaOutput = meta ? meta : '';
    
     
    switch (level) {
    case LogLevel.ERROR:
      // eslint-disable-next-line no-console
      console.error(formattedMessage, metaOutput);
      break;
    case LogLevel.WARN:
      // eslint-disable-next-line no-console
      console.warn(formattedMessage, metaOutput);
      break;
    case LogLevel.INFO:
    case LogLevel.DEBUG:
    default:
      // eslint-disable-next-line no-console
      console.log(formattedMessage, metaOutput);
      break;
    }
  }
}

// Export a singleton instance
export const logger = new Logger();
