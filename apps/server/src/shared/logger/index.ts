import { appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

interface LogMetadata {
  [key: string]: unknown;
  requestId?: string;
  error?: Error;
}

class Logger {
  private logsDir: string;
  private isDevelopment: boolean;

  constructor() {
    this.logsDir = join(process.cwd(), "logs");
    this.isDevelopment = process.env.NODE_ENV !== "production";
    this.ensureLogsDirectory();
  }

  private ensureLogsDirectory(): void {
    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir, { recursive: true });
    }
  }

  private getLogFileName(): string {
    const date = new Date().toISOString().split("T")[0];
    return join(this.logsDir, `app-${date}.log`);
  }

  private formatTimestamp(): string {
    return new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  private writeToFile(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
  ): void {
    try {
      const timestamp = this.formatTimestamp();
      const logFileName = this.getLogFileName();

      let logEntry: string;

      if (this.isDevelopment) {
        // Pretty format for development
        const metaStr =
          metadata && Object.keys(metadata).length > 0
            ? ` ${JSON.stringify(metadata, null, 2)}`
            : "";
        logEntry = `[${timestamp}] [${level}] ${message}${metaStr}\n`;
      } else {
        // JSON lines format for production
        const logObject = {
          timestamp,
          level,
          message,
          ...metadata,
        };
        logEntry = JSON.stringify(logObject) + "\n";
      }

      appendFileSync(logFileName, logEntry, "utf8");
    } catch (error) {
      // Fallback to console if file writing fails
      // eslint-disable-next-line no-console
      console.error("Failed to write to log file:", error);
    }
  }

  private formatError(error: Error): Record<string, unknown> {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  error(
    message: string,
    error?: Error,
    metadata?: Record<string, unknown>,
  ): void {
    const meta: LogMetadata = { ...metadata };

    if (error) {
      meta.error = this.formatError(error) as never;
    }

    this.writeToFile("ERROR", message, meta);

    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${message}`, error || "", meta);
    }
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.writeToFile("WARN", message, metadata);

    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, metadata || "");
    }
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.writeToFile("INFO", message, metadata);

    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, metadata || "");
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      this.writeToFile("DEBUG", message, metadata);
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, metadata || "");
    }
  }
}

export const logger = new Logger();
