# Query Utilities

Shared utilities for pagination, filtering, sorting, and search in GET list endpoints.

## Overview

This module provides reusable, type-safe utilities to handle common query operations across all modules. All types are shared between the web app and server via `@suba-platform/types/api`.

## Core Components

### 1. Query Parsers (`parser.ts`)

Zod schemas for validating and parsing query parameters:

- **`paginationSchema`**: Handles `page` (default: 1) and `limit` (1-100, default: 10)
- **`sortSchema`**: Handles `sortBy` (field name) and `sortOrder` ('asc' | 'desc', default: 'desc')
- **`searchSchema`**: Handles `search` (string)
- **`dateRangeSchema`**: Handles `startDate` and `endDate` (ISO datetime strings)
- **`baseListQuerySchema`**: Combined pagination + sort + search schemas

**Example:**

```typescript
import {
  paginationSchema,
  sortSchema,
  searchSchema,
} from "../../shared/query/parser";

export const myResourceQuerySchema = paginationSchema
  .merge(sortSchema)
  .merge(searchSchema)
  .extend({
    // Add resource-specific filters
    status: z.enum(["active", "inactive"]).optional(),
    categoryId: z.coerce.number().int().positive().optional(),
  });
```

### 2. Query Builder (`builder.ts`)

Type-safe Drizzle query composition with the `QueryBuilder` class:

**Configuration:**

```typescript
const myQueryBuilder = createQueryBuilder({
  table: myTable,
  searchFields: [myTable.title, myTable.description],
  allowedSortFields: [myTable.createdAt, myTable.title, myTable.status],
  defaultSortField: myTable.createdAt,
});
```

**Methods:**

- `applyPagination(query, page, limit)`: Adds LIMIT and OFFSET to query
- `applySort(query, sortBy?, sortOrder?)`: Adds ORDER BY clause
- `applySearch(searchTerm?)`: Returns SQL condition for full-text search across configured fields

### 3. Repository Helpers (`repository-helpers.ts`)

Utility functions for common repository operations:

- **`countRecords(db, table, whereCondition?)`**: Count total records matching filter
- **`buildListResult(items, total, page, limit)`**: Construct `ListResult<T>` response

## Usage Pattern

### Step 1: Define Query Schema (validators.ts)

```typescript
import {
  paginationSchema,
  sortSchema,
  searchSchema,
} from "../../shared/query/parser";

export const partnerQuerySchema = paginationSchema
  .merge(sortSchema)
  .merge(searchSchema)
  .extend({
    type: z.enum(["client", "investor"]).optional(),
  });

export type PartnerQuery = z.infer<typeof partnerQuerySchema>;
```

### Step 2: Create Query Builder & Repository (repository.ts)

```typescript
import {
  createQueryBuilder,
  countRecords,
  buildListResult,
} from "../../shared/query";
import { partners } from "@suba-platform/db/schema";

const partnerQueryBuilder = createQueryBuilder({
  table: partners,
  searchFields: [partners.name, partners.description],
  allowedSortFields: [partners.createdAt, partners.name],
  defaultSortField: partners.createdAt,
});

export const createPartnerRepository = (db: DbClient) => ({
  async findAll(query: PartnerQuery) {
    const { page, limit, search, sortBy, sortOrder, type } = query;

    // Build filters
    const conditions = [];
    if (type) {
      conditions.push(eq(partners.type, type));
    }

    const searchCondition = partnerQueryBuilder.applySearch(search);
    if (searchCondition) {
      conditions.push(searchCondition);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Build query
    let dbQuery = db.select().from(partners);
    if (whereClause) {
      dbQuery = dbQuery.where(whereClause);
    }

    dbQuery = partnerQueryBuilder.applySort(dbQuery, sortBy, sortOrder);
    dbQuery = partnerQueryBuilder.applyPagination(dbQuery, page, limit);

    const items = await dbQuery;
    const total = await countRecords(db, partners, whereClause);

    return buildListResult(items, total, page, limit);
  },
  // ... other repository methods
});
```

### Step 3: Pass Through Service (service.ts)

```typescript
export const createPartnerService = (repository: PartnerRepository) => ({
  async getPartners(query: PartnerQuery) {
    return await repository.findAll(query);
  },
  // ... other service methods
});
```

### Step 4: Use in Controller (controller.ts)

```typescript
import { paginatedResponse } from "../../core/http";

export const createPartnerController = (service: PartnerService) => ({
  async listPartners(c: Context) {
    const query = partnerQuerySchema.parse(c.req.query());
    const result = await service.getPartners(query);

    return paginatedResponse(c, result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  },
  // ... other controller methods
});
```

## Query Parameter Conventions

Standard query parameters supported:

- **Pagination:**
  - `?page=2` - Page number (default: 1)
  - `?limit=50` - Items per page (1-100, default: 10)

- **Sorting:**
  - `?sortBy=createdAt` - Field to sort by
  - `?sortOrder=asc` - Sort direction ('asc' | 'desc', default: 'desc')

- **Search:**
  - `?search=keyword` - Full-text search across configured fields

- **Filtering:**
  - Add resource-specific filters in your query schema
  - Example: `?status=active&categoryId=5`

## Type Safety

All types are shared via `@suba-platform/types/api`:

```typescript
import type {
  ListResult,
  PaginationParams,
  SortParams,
  SearchParams,
} from "@suba-platform/types/api";
```

This ensures consistency between frontend and backend.

## Response Format

The `paginatedResponse` helper (in `core/http.ts`) returns:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "timestamp": "2025-10-23T10:30:00Z",
    "requestId": "abc-123",
    "pagination": {
      "page": 2,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

## Best Practices

1. **Always validate inputs**: Use Zod schemas to parse query parameters
2. **Limit sort fields**: Only allow sorting on indexed columns for performance
3. **Configure search fields**: Only search fields that make semantic sense
4. **Apply filters before counting**: Use the same `whereClause` for both query and count
5. **Set reasonable limits**: Default limit of 10, max of 100
6. **Use consistent naming**: Follow existing patterns for filter parameters

## Example API Requests

```bash
# Basic pagination
GET /api/v1/blogs?page=1&limit=10

# With search
GET /api/v1/blogs?search=typescript&page=1

# With filters and sorting
GET /api/v1/blogs?published=true&sortBy=publishDate&sortOrder=desc&page=2

# Multiple filters
GET /api/v1/partners?type=client&search=tech&sortBy=name&sortOrder=asc
```
