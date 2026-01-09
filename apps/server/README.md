# Company Template API Server

Hono-based REST API following a modular, domain-driven architecture.

## Project Structure

```
src/
├── core/               # HTTP and application infrastructure
│   ├── app.ts         # Hono instance setup + middleware
│   ├── router.ts      # Global route registration
│   ├── http.ts        # Error classes + response helpers
│   ├── container.ts   # Dependency injection container
│   ├── config/        # Environment variable validation
│   │   └── env.ts
│   └── middleware/    # Shared middleware
│       └── error-handler.ts
├── modules/           # Feature domains
│   ├── blogs/        # Blog management module
│   │   ├── controller.ts    # HTTP handlers
│   │   ├── service.ts       # Business logic
│   │   ├── repository.ts    # Data access
│   │   ├── routes.ts        # Route definitions
│   │   ├── validators.ts    # Request validation
│   │   ├── schema.ts        # Response DTOs
│   │   └── index.ts         # Module initialization
│   └── index.ts      # Module registration
└── shared/           # Cross-cutting utilities
    ├── db/           # Database client
    ├── auth/guards/  # Authorization helpers
    └── types/        # Common types

scripts/
└── new-module.ts     # Generate new module scaffolding
```

## Architecture Patterns

### Layered Architecture

Each module follows a clean layered architecture:

1. **Routes** → HTTP routing and method mapping
2. **Controller** → Request/response handling, validation
3. **Service** → Business logic, orchestration
4. **Repository** → Data access, database queries

### Dependency Injection

Modules are initialized with explicit dependency injection:

```typescript
const repository = createBlogRepository(db);
const service = createBlogService(repository);
const controller = createBlogController(service);
const routes = createBlogRoutes(controller);
```

This enables:

- Easy testing with mocked dependencies
- Clear separation of concerns
- Type-safe composition

## Adding a New Module

Use the scaffolding script:

```bash
bun run scripts/new-module.ts <module-name>
```

For example:

```bash
bun run scripts/new-module.ts partners
```

This creates:

- Complete module structure with all necessary files
- Type-safe repository, service, and controller templates
- Request validation schemas
- Response DTOs

Then:

1. Update the generated files with your domain logic
2. Register the module in `src/modules/index.ts`:

```typescript
import { initPartnersModule } from "./partners";

export const registerModules = (app: Hono) => {
  app.route("/api/v1/partners", initPartnersModule());
  // ... other modules
};
```

## Available Scripts

- `bun dev` — Start development server with hot reload
- `bun run check-types` — Run TypeScript type checking
- `bun build` — Build for production
- `bun start` — Start production server

## Environment Variables

Required variables (validated via Zod in `src/core/config/env.ts`):

- `NODE_ENV` — Environment (development | production | test)
- `PORT` — Server port (default: 3000)
- `CORS_ORIGIN` — Allowed CORS origin
- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Auth secret (min 32 chars)
- `BETTER_AUTH_URL` — Auth callback URL
- `GOOGLE_CLIENT_ID` — Google OAuth client ID (for social sign-in)
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret (for social sign-in)

## Example: Blogs Module

The blogs module demonstrates the complete pattern:

- **Repository** — CRUD operations, tag relationships, pagination
- **Service** — Business logic, error handling, data transformation
- **Controller** — Request validation, response formatting
- **Routes** — RESTful endpoints:
  - `GET /api/v1/blogs` — List blogs (with pagination, filters)
  - `GET /api/v1/blogs/:id` — Get blog by ID
  - `GET /api/v1/blogs/slug/:slug` — Get blog by slug
  - `POST /api/v1/blogs` — Create blog
  - `PATCH /api/v1/blogs/:id` — Update blog
  - `DELETE /api/v1/blogs/:id` — Delete blog

## Best Practices

1. **Type Safety** — Export types from repositories and services for DI
2. **Validation** — Use Zod schemas for all inputs
3. **DTOs** — Define response schemas to avoid leaking DB internals
4. **Error Handling** — Use custom error classes from `core/http.ts`
5. **Pure Functions** — Keep repositories focused on data access only
6. **Framework Agnostic** — Services should not depend on Hono types
