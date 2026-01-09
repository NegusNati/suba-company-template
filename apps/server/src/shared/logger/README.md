# Logger

Simple file-based logger for the Company Template API server.

## Features

- Logs to daily rotated files: `apps/server/logs/app-YYYY-MM-DD.log`
- Supports multiple log levels: `error`, `warn`, `info`, `debug`
- Includes requestId and metadata in logs
- Pretty format in development, JSON lines in production
- Console output in development mode only

## Usage

```typescript
import { logger } from "../shared/logger";

// Error logging with Error object
try {
  // some code
} catch (error) {
  logger.error("Failed to process request", error as Error, {
    userId: 123,
    requestId: c.get("requestId"),
  });
}

// Warning logging
logger.warn("Rate limit approaching", {
  currentRate: 90,
  limit: 100,
});

// Info logging
logger.info("User registered successfully", {
  userId: 123,
  email: "user@example.com",
});

// Debug logging (only in development)
logger.debug("Processing data", {
  dataSize: 1024,
  processingTime: 100,
});
```

## Log File Location

Logs are written to:

```
apps/server/logs/app-YYYY-MM-DD.log
```

Example:

- `apps/server/logs/app-2025-10-24.log`
- `apps/server/logs/app-2025-10-25.log`

## Log Format

### Development (Pretty)

```
[2025-10-24 08:30:45] [ERROR] Failed to create contact {
  "requestId": "abc123",
  "error": {
    "name": "ValidationError",
    "message": "Invalid email format",
    "stack": "..."
  }
}
```

### Production (JSON Lines)

```json
{
  "timestamp": "2025-10-24 08:30:45",
  "level": "ERROR",
  "message": "Failed to create contact",
  "requestId": "abc123",
  "error": {
    "name": "ValidationError",
    "message": "Invalid email format",
    "stack": "..."
  }
}
```

## Log Levels

- **error**: Critical errors that need immediate attention
- **warn**: Warning conditions that should be reviewed
- **info**: Informational messages about application flow
- **debug**: Detailed debugging information (development only)

## Notes

- Logs directory is gitignored but includes `.gitkeep` to track the folder
- Old log files are kept (manual cleanup required if needed)
- File writing is synchronous to ensure critical errors are captured
- Console output mirrors file logs in development mode
