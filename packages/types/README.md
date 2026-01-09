# @suba-company-template/types

Shared TypeScript types and interfaces for the Company Template monorepo.

## Purpose

This package provides a single source of truth for type definitions shared between the `web` and `server` applications, ensuring type safety across the entire API boundary.

## Structure

```
src/
├── api/              # API-related types
│   ├── response.ts   # Success/Error response formats
│   └── errors.ts     # Error codes and types
├── entities/         # Business entity types (future)
└── index.ts          # Main exports
```

## Usage

### In Server (`apps/server`)

```typescript
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ValidationErrorDetail,
} from "@suba-platform/types/api";
import { ErrorCodes } from "@suba-platform/types/api";

// Use in response helpers
const response: ApiSuccessResponse<Blog> = {
  success: true,
  data: blog,
  meta: {
    timestamp: new Date().toISOString(),
    requestId: "abc-123",
  },
};

// Use error codes
throw new AppError(404, ErrorCodes.NOT_FOUND, "Blog not found");
```

### In Web App (`apps/web`)

```typescript
import type { ApiSuccessResponse } from "@suba-platform/types/api";

// Type-safe API responses with React Query
const { data } = useQuery<ApiSuccessResponse<Blog[]>>({
  queryKey: ["blogs"],
  queryFn: () => fetch("/api/v1/blogs").then((r) => r.json()),
});

// Access with full type safety
if (data?.success) {
  console.log(data.data); // Blog[]
  console.log(data.meta?.requestId); // string | undefined
}
```

## API Response Format

### Success Response

```typescript
{
  "success": true,
  "data": T,
  "meta": {
    "timestamp": "2024-01-20T10:30:00Z",
    "requestId": "abc-123",
    "pagination": {        // Optional, for paginated endpoints
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  },
  "links": {              // Optional, HATEOAS support
    "self": "/api/v1/blogs?page=1",
    "next": "/api/v1/blogs?page=2"
  }
}
```

### Error Response

```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "statusCode": 400,
    "details": [          // Optional, for validation errors
      {
        "field": "email",
        "message": "Invalid email format",
        "value": "invalid-email"
      }
    ],
    "stack": "..."       // Only in development
  },
  "meta": {
    "timestamp": "2024-01-20T10:30:00Z",
    "requestId": "abc-123",
    "path": "/api/v1/blogs"
  }
}
```

## Available Error Codes

- `VALIDATION_ERROR` - Input validation failed (400)
- `NOT_FOUND` - Resource not found (404)
- `UNAUTHORIZED` - Authentication required (401)
- `FORBIDDEN` - Insufficient permissions (403)
- `CONFLICT` - Resource conflict (409)
- `BAD_REQUEST` - Malformed request (400)
- `INTERNAL_ERROR` - Server error (500)

## Development

Build the package:

```bash
bun run --filter @suba-platform/types build
```

The package uses `tsdown` for building and generates both ESM output and TypeScript declaration files.
