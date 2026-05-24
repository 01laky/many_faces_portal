import axios from 'axios';
import { env } from '../config/env';
import { redactLogProperties, redactSensitiveLogText } from './logRedaction';

/**
 * Log levels matching Seq log levels
 */
export const LogLevel = {
  Verbose: 'Verbose',
  Debug: 'Debug',
  Information: 'Information',
  Warning: 'Warning',
  Error: 'Error',
  Fatal: 'Fatal',
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

/**
 * Frontend logger that sends logs to Seq
 */
class FrontendLogger {
  private seqUrl: string;
  private enabled: boolean;
  private buffer: Array<{
    Timestamp: string;
    Level: string;
    MessageTemplate: string;
    Properties: Record<string, unknown>;
  }> = [];
  private flushInterval: number = 5000; // Flush every 5 seconds
  private maxBufferSize: number = 100;
  private lastSeqErrorAt: number = 0;
  constructor() {
    // Get Seq URL from environment config
    this.seqUrl = env.seqUrl;
    // Disable Seq in dev to avoid CORS/503 spam; enable only when explicitly needed
    this.enabled = import.meta.env.PROD ? env.enableSeqLogging : false;

    // Periodic flush; skip ticks while tab hidden to reduce wakeups (buffer flushes on focus).
    if (this.enabled && typeof document !== 'undefined') {
      setInterval(() => {
        if (document.hidden) return;
        void this.flush();
      }, this.flushInterval);
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          void this.flush();
        }
      });
    }
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, message: string, properties?: Record<string, unknown>) {
    const safeMessage = redactSensitiveLogText(message);
    const safeProperties = redactLogProperties(properties);
    const logEntry = {
      Timestamp: new Date().toISOString(),
      Level: level,
      MessageTemplate: safeMessage,
      Properties: {
        Source: 'Frontend',
        UserAgent: navigator.userAgent,
        Url: window.location.href,
        ...safeProperties,
      },
    };

    // Add to buffer
    this.buffer.push(logEntry);

    // Flush if buffer is full
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }

    // Also log to console in development
    if (import.meta.env.DEV) {
      const consoleMethod = this.getConsoleMethod(level);
      consoleMethod(`[${level}]`, safeMessage, safeProperties || '');
    }
  }

  /**
   * Get console method for log level
   */
  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case LogLevel.Error:
      case LogLevel.Fatal:
        return console.error;
      case LogLevel.Warning:
        return console.warn;
      case LogLevel.Debug:
      case LogLevel.Verbose:
        return console.debug;
      default:
        return console.log;
    }
  }

  /**
   * Flush buffered logs to Seq
   */
  private async flush() {
    if (this.buffer.length === 0 || !this.enabled) {
      return;
    }

    const logsToSend = [...this.buffer];
    this.buffer = [];

    try {
      // Send logs to Seq ingestion endpoint
      await axios.post(`${this.seqUrl}/api/events/raw`, logsToSend, {
        headers: {
          'Content-Type': 'application/vnd.serilog.clef',
        },
        timeout: 5000,
      });
    } catch (error) {
      // If Seq is not available, put logs back in buffer (except in production)
      if (import.meta.env.DEV) {
        // Suppress repeated warnings (max once per minute) to avoid console spam
        const now = Date.now();
        if (!this.lastSeqErrorAt || now - this.lastSeqErrorAt > 60000) {
          this.lastSeqErrorAt = now;
          console.warn('Failed to send logs to Seq:', error);
        }
        // Put logs back at the beginning of buffer
        this.buffer.unshift(...logsToSend);
        // Limit buffer size
        if (this.buffer.length > this.maxBufferSize * 2) {
          this.buffer = this.buffer.slice(0, this.maxBufferSize);
        }
      }
    }
  }

  /**
   * Log verbose message
   */
  verbose(message: string, properties?: Record<string, unknown>) {
    this.log(LogLevel.Verbose, message, properties);
  }

  /**
   * Log debug message
   */
  debug(message: string, properties?: Record<string, unknown>) {
    this.log(LogLevel.Debug, message, properties);
  }

  /**
   * Log information message
   */
  info(message: string, properties?: Record<string, unknown>) {
    this.log(LogLevel.Information, message, properties);
  }

  /**
   * Log warning message
   */
  warn(message: string, properties?: Record<string, unknown>) {
    this.log(LogLevel.Warning, message, properties);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, properties?: Record<string, unknown>) {
    const errorProperties: Record<string, unknown> = {
      ...properties,
    };

    if (error instanceof Error) {
      errorProperties.ErrorMessage = error.message;
      errorProperties.ErrorStack = error.stack;
      errorProperties.ErrorName = error.name;
    } else if (error) {
      errorProperties.Error = String(error);
    }

    this.log(LogLevel.Error, message, errorProperties);
  }

  /**
   * Log fatal error message
   */
  fatal(message: string, error?: Error | unknown, properties?: Record<string, unknown>) {
    const errorProperties: Record<string, unknown> = {
      ...properties,
    };

    if (error instanceof Error) {
      errorProperties.ErrorMessage = error.message;
      errorProperties.ErrorStack = error.stack;
      errorProperties.ErrorName = error.name;
    } else if (error) {
      errorProperties.Error = String(error);
    }

    this.log(LogLevel.Fatal, message, errorProperties);
    // Flush immediately for fatal errors
    this.flush();
  }

  /**
   * Manually flush logs
   */
  async flushLogs() {
    await this.flush();
  }
}

// Export singleton instance
export const logger = new FrontendLogger();

// Export default for convenience
export default logger;
