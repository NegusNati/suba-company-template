# Server Logging Guide

## Overview

The server uses a custom file-based logger that writes to daily rotated log files in `apps/server/logs/`.

## Quick Start

```typescript
import { logger } from "./shared/logger";

// Log errors with full context
logger.error("Operation failed", error, { requestId, userId });

// Log warnings
logger.warn("High memory usage", { memoryMB: 512 });

// Log info
logger.info("User logged in", { userId: 123 });

// Debug (dev only)
logger.debug("Processing batch", { size: 100 });
```

## Log Files

Logs are written to: `apps/server/logs/app-YYYY-MM-DD.log`

Example:

```
apps/server/logs/
├── .gitkeep
├── app-2025-10-24.log
└── app-2025-10-25.log
```

## Viewing Logs

```bash
# View today's logs
tail -f apps/server/logs/app-$(date +%Y-%m-%d).log

# Search for errors
grep ERROR apps/server/logs/app-*.log

# View all logs from today
cat apps/server/logs/app-$(date +%Y-%m-%d).log
```

## Integration

The logger is already integrated in:

- ✅ Error handler (`core/http.ts`)
- ✅ Contacts controller (`modules/contacts/controller.ts`)

To add to new modules:

```typescript
import { logger } from "../../shared/logger";

// In controllers, include requestId
const requestId = c.get("requestId");
logger.info("Action performed", { requestId, ...data });
```

## Best Practices

1. **Always include requestId** when available (from Hono context)
2. **Use appropriate log levels**:
   - `error`: Critical failures requiring attention
   - `warn`: Important but non-critical issues
   - `info`: Notable application events
   - `debug`: Detailed debugging (dev only)

3. **Add meaningful metadata**:

   ```typescript
   logger.error("Payment failed", error, {
     requestId,
     userId: user.id,
     amount: payment.amount,
     currency: payment.currency,
   });
   ```

4. **Don't log sensitive data**: passwords, tokens, full credit card numbers, etc.

## Console vs Logger

❌ **Don't use console directly:**

```typescript
console.log("User created", user); // Lint error!
console.error("Failed:", error); // Lint error!
```

✅ **Use logger instead:**

```typescript
logger.info("User created", { userId: user.id });
logger.error("Operation failed", error, { requestId });
```

## Development vs Production

- **Development**: Logs to both file AND console (pretty format)
- **Production**: Logs to file only (JSON lines format)

Set via `NODE_ENV` environment variable.
