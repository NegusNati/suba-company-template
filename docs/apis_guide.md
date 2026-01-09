# API Module Development Guide

> Updated: November 2025 — covers partial updates, shared query helpers, and slug conventions.

The Company Template backend is a modular Hono application. Every feature lives inside `apps/server/src/modules/<feature>` and plugs into a shared HTTP shell. This guide is the primary reference for introducing or extending API modules so they remain consistent, testable, and easy for future contributors to maintain.

---

## 1. Architecture & Request Flow

1. `apps/server/src/index.ts` reads configuration, builds the Hono app via `core/app.ts`, and invokes `registerModules(app)`.
2. `core/app.ts` wires global middleware (logging, request IDs, error handler, CORS, Better Auth handlers) and exposes health/endpoints.
3. `core/router.ts` delegates feature registration to `modules/index.ts`, keeping HTTP bootstrapping isolated from domain code.
4. Each module factory (`modules/<feature>/index.ts`) constructs repository → service → controller → router stacks using the shared dependencies in `shared/`.
5. Controllers translate Hono `Context` into domain calls, services orchestrate business logic, and repositories execute Drizzle queries against the Postgres schema defined in `packages/db`.

Always depend downward (module → shared → core). Core never reaches into feature code; shared utilities must stay generic.

---

## 2. Module Blueprint

All modules follow the same structure. Use the table below as a checklist when scaffolding or auditing a feature.

| File            | Purpose                                                                      | Key Practices                                                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `validators.ts` | Zod schemas for payloads, params, and query strings; exports inferred types. | Compose from `shared/query/parser` for pagination/search. Build update schemas via the strategy in `docs/update_requests.md` so PATCH payloads accept sparse fields while rejecting empty bodies.                                |
| `schema.ts`     | Response DTO builders to shield raw DB rows.                                 | Export DTO types that match what controllers send (`toAdminDTO`, `toPublicDTO`). Filter out internal columns and normalize nullables.                                                                                            |
| `repository.ts` | Data access with injected `DbClient`.                                        | Use `createQueryBuilder`, `countRecords`, and `buildListResult` from `shared/query`. Strip `undefined` fields before `.set()` to preserve partial update semantics. Keep derived data (slug generation, timestamps) centralized. |
| `service.ts`    | Business orchestration.                                                      | Fetch existing entities before update/delete, map DB errors to `AppError` subclasses (`NotFoundError`, `ConflictError`), handle slug regeneration, and trigger events when needed.                                               |
| `controller.ts` | HTTP adapter around the service.                                             | Parse params, query, and body with validators; raise `ValidationError` for malformed input; respond via `successResponse` / `paginatedResponse`. Controllers stay thin.                                                          |
| `routes.ts`     | Wires routers and middleware.                                                | Provide an authenticated router (admin) and optional public `clientRouter`. Apply `requireAuth`/`requireRole` guards before handlers.                                                                                            |
| `index.ts`      | Module bootstrap.                                                            | Instantiate repository → service → controller → routes using the shared `db`. Export types, factory, and DTOs for consumers.                                                                                                     |
| `__tests__/`    | Unit/integration specs (future).                                             | Mirror repository/service patterns once Bun test harness lands.                                                                                                                                                                  |

Reference implementations: `case-studies`, `partners`, and `testimonials` showcase the full pattern, including public feeds.

### Example Module Skeleton

```ts
// validators.ts
import { z } from "zod";
import {
  paginationSchema,
  sortSchema,
  searchSchema,
} from "../../shared/query/parser";
import { buildUpdateSchema } from "../../shared/validators/update";

export const createThingSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().optional(),
});

export const updateThingSchema = buildUpdateSchema(
  createThingSchema.omit({ slug: true }),
);

export const thingQuerySchema = paginationSchema
  .merge(sortSchema)
  .merge(searchSchema)
  .extend({
    sortBy: z.enum(["createdAt", "title", "updatedAt"]).optional(),
  });

export type CreateThingInput = z.infer<typeof createThingSchema>;
export type UpdateThingInput = z.infer<typeof updateThingSchema>;
export type ThingQuery = z.infer<typeof thingQuerySchema>;
```

```ts
// repository.ts
import { and, eq } from "@suba-platform/db/orm";
import { things } from "@suba-platform/db/schema";

import type { DbClient } from "../../shared/db";
import {
  createQueryBuilder,
  countRecords,
  buildListResult,
} from "../../shared/query";
import { stripUndefinedValues } from "../../shared/utils/object";
import type {
  CreateThingInput,
  UpdateThingInput,
  ThingQuery,
} from "./validators";

export const createThingRepository = (db: DbClient) => {
  const builder = createQueryBuilder({
    table: things,
    searchFields: [things.title, things.description],
    allowedSortFields: [things.createdAt, things.title, things.updatedAt],
    defaultSortField: things.createdAt,
  });

  return {
    async findAll({ page, limit, search, sortBy, sortOrder }: ThingQuery) {
      const conditions = [];
      const searchCondition = builder.applySearch(search);
      if (searchCondition) conditions.push(searchCondition);

      const whereClause = conditions.length ? and(...conditions) : undefined;
      const baseQuery = db.select().from(things);
      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const items = await builder.applyPagination(
        builder.applySort(queryWithWhere, sortBy, sortOrder),
        page,
        limit,
      );
      const total = await countRecords(db, things, whereClause);

      return buildListResult(items, total, page, limit);
    },

    async findById(id: number) {
      const [row] = await db
        .select()
        .from(things)
        .where(eq(things.id, id))
        .limit(1);
      return row ?? null;
    },

    async findBySlug(slug: string) {
      const [row] = await db
        .select()
        .from(things)
        .where(eq(things.slug, slug))
        .limit(1);
      return row ?? null;
    },

    async create(data: CreateThingInput) {
      const [created] = await db.insert(things).values(data).returning();
      if (!created) throw new Error("Failed to create thing");
      return created;
    },

    async update(id: number, data: UpdateThingInput) {
      const payload = stripUndefinedValues({
        ...data,
        updatedAt: new Date().toISOString(),
      });
      const [updated] = await db
        .update(things)
        .set(payload)
        .where(eq(things.id, id))
        .returning();
      return updated;
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(things)
        .where(eq(things.id, id))
        .returning();
      return deleted;
    },
  };
};

export type ThingRepository = ReturnType<typeof createThingRepository>;
```

```ts
// service.ts
import { NotFoundError, ConflictError } from "../../core/http";
import { ensureUniqueSlug, generateSlug } from "../../shared/utils/slug";
import type {
  ThingRepository,
  ThingQuery,
  CreateThingInput,
  UpdateThingInput,
} from "./repository";

export const createThingService = (repository: ThingRepository) => ({
  async getThings(query: ThingQuery) {
    return repository.findAll(query);
  },

  async getThing(id: number) {
    const thing = await repository.findById(id);
    if (!thing) throw new NotFoundError(`Thing ${id} not found`);
    return thing;
  },

  async createThing(data: CreateThingInput) {
    const slug =
      data.slug ||
      (await ensureUniqueSlug(generateSlug(data.title), async (candidate) => {
        const existing = await repository.findBySlug(candidate);
        return Boolean(existing);
      }));

    try {
      return await repository.create({ ...data, slug });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("unique constraint")
      ) {
        throw new ConflictError(`Thing with slug "${slug}" already exists`);
      }
      throw error;
    }
  },

  async updateThing(id: number, data: UpdateThingInput) {
    const existing = await repository.findById(id);
    if (!existing) throw new NotFoundError(`Thing ${id} not found`);

    try {
      return await repository.update(id, data);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("unique constraint")
      ) {
        throw new ConflictError("Thing slug already exists");
      }
      throw error;
    }
  },

  async deleteThing(id: number) {
    const existing = await repository.findById(id);
    if (!existing) throw new NotFoundError(`Thing ${id} not found`);
    await repository.delete(id);
    return { message: "Thing deleted" };
  },
});

export type ThingService = ReturnType<typeof createThingService>;
```

```ts
// controller.ts
import type { Context } from "hono";
import {
  successResponse,
  paginatedResponse,
  ValidationError,
} from "../../core/http";
import {
  thingQuerySchema,
  createThingSchema,
  updateThingSchema,
} from "./validators";
import type { ThingService } from "./service";

export const createThingController = (service: ThingService) => ({
  async listThings(c: Context) {
    const query = thingQuerySchema.parse(c.req.query());
    const result = await service.getThings(query);
    return paginatedResponse(c, result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  },

  async getThing(c: Context) {
    const id = parseInt(c.req.param("id"));
    if (Number.isNaN(id)) throw new ValidationError("Invalid thing ID");
    const thing = await service.getThing(id);
    return successResponse(c, thing);
  },

  async createThing(c: Context) {
    const data = createThingSchema.parse(await c.req.json());
    const thing = await service.createThing(data);
    return successResponse(c, thing, 201);
  },

  async updateThing(c: Context) {
    const id = parseInt(c.req.param("id"));
    if (Number.isNaN(id)) throw new ValidationError("Invalid thing ID");
    const data = updateThingSchema.parse(await c.req.json());
    const thing = await service.updateThing(id, data);
    return successResponse(c, thing);
  },

  async deleteThing(c: Context) {
    const id = parseInt(c.req.param("id"));
    if (Number.isNaN(id)) throw new ValidationError("Invalid thing ID");
    await service.deleteThing(id);
    return successResponse(c, { message: "Thing deleted" });
  },
});

export type ThingController = ReturnType<typeof createThingController>;
```

```ts
// routes.ts
import { Hono } from "hono";
import { requireAuth, requireRole } from "../../shared/auth/guards";
import type { ThingController } from "./controller";

export const createThingRoutes = (controller: ThingController) => {
  const clientRouter = new Hono();
  // Public endpoints are optional—remove if the feature is admin-only.
  if (controller.listPublicThings) {
    clientRouter.get("/", (c) => controller.listPublicThings!(c));
  }
  if (controller.getPublicThingBySlug) {
    clientRouter.get("/:slug", (c) => controller.getPublicThingBySlug!(c));
  }

  const router = new Hono();
  router.use("/*", requireAuth);
  router.use("/*", requireRole("ADMIN"));

  router.get("/", (c) => controller.listThings(c));
  router.get("/:id", (c) => controller.getThing(c));
  router.post("/", (c) => controller.createThing(c));
  router.patch("/:id", (c) => controller.updateThing(c));
  router.delete("/:id", (c) => controller.deleteThing(c));

  return { router, clientRouter };
};
```

```ts
// index.ts
import { db } from "../../shared/db";
import { createThingRepository } from "./repository";
import { createThingService } from "./service";
import { createThingController } from "./controller";
import { createThingRoutes } from "./routes";

export const initThingsModule = () => {
  const repository = createThingRepository(db);
  const service = createThingService(repository);
  const controller = createThingController(service);
  const { router, clientRouter } = createThingRoutes(controller);

  return { router, clientRouter };
};

export * from "./schema";
export * from "./validators";
```

Use the snippets as a baseline, then tailor each module to its specific domain (relations, DTO shapes, public feeds, etc.).

---

## 3. Cross-Cutting Patterns

### 3.1 Authentication & Authorization

- Use `requireAuth` to hydrate the session; it stores `user` and `session` on the context.
- Chain `requireRole("ADMIN")` or other role guards from `shared/auth/guards` for dashboard-only routes.
- Public routes (landing page feeds) must live on a dedicated `clientRouter` that omits guards. Mount it under `/api/v1/<feature>/client` in `modules/index.ts`.
- Controllers can safely call `c.get("user")` or `c.get("userProfile")` after guards execute. Never hit Better Auth directly from feature code.

### 3.2 Validation & Partial Updates

- Base schemas should describe full create payloads. Derive update schemas using the approach in `docs/update_requests.md`:

  ```ts
  import { buildUpdateSchema } from "../../shared/validators/update"; // planned helper

  export const createSchema = z.object({ title: z.string().min(1) /* ... */ });
  export const updateSchema = buildUpdateSchema(
    createSchema.omit({ slug: true }),
  );
  ```

- If the helper is not yet implemented, mimic its behavior: `createSchema.partial()` plus `.refine` to require at least one field.
- Controllers must reject empty bodies and pass only validated objects to services. Services should merge derived fields (e.g., slug recalculation) without forcing callers to resend unrelated attributes.
- When allowing nullable clears, distinguish `null` (explicit reset) from `undefined` (leave unchanged). Sanitise objects before repository calls so `undefined` keys are removed.

### 3.3 Query, Pagination & Filtering

- Import parsers from `shared/query/parser`: `paginationSchema`, `sortSchema`, `searchSchema`, and compose them for each module.
- Use `createQueryBuilder` to apply `applySearch`, `applySort`, and `applyPagination`. Configure `searchFields`, `allowedSortFields`, and `defaultSortField` to match the table.
- Combine filters using Drizzle expressions (`and`, `eq`, `inArray`). Keep filter logic in repositories so controllers remain declarative.
- Return list results using `buildListResult(items, total, page, limit)` to stay compatible with `paginatedResponse`.

### 3.4 Slug Management & Uniqueness

- Prefer storing slugs in the database and generating them automatically with `shared/utils/slug.ts`:
  ```ts
  const slug =
    data.slug ??
    (await ensureUniqueSlug(generateSlug(data.title), checkExists));
  ```
- Allow optional manual slugs on create when product requires it, but enforce the lowercase hyphen format at the validator layer.
- Decide whether updates may mutate slugs. Default to immutable slugs; if they can change, ensure downstream references (e.g., case studies) update accordingly.
- Catch unique constraint violations in the service layer and surface them as `ConflictError` with actionable messages.

### 3.5 Repositories & Data Access

- Accept `DbClient` from `shared/db` and never import Drizzle directly elsewhere.
- Keep queries pure. For complex operations (e.g., syncing `service_images`), consider wrapping in a transaction when multiple statements must succeed together.
- Before calling `.set()`, remove `undefined` keys to avoid overwriting columns; a shared `stripUndefinedValues` helper is recommended (see `docs/update_requests.md`).
- Always set `updatedAt` manually when updating records, even if triggers exist. This keeps behavior consistent across tables.
- Use `countRecords` for pagination totals and return `null` from finder methods when rows are missing so services can throw `NotFoundError`.

### 3.6 Service Layer

- Fetch existing entities ahead of updates/deletes to enforce `NotFoundError` handling and to support derived field logic.
- Wrap repository calls with try/catch when you need to map database errors (unique constraints, foreign key violations) to domain-friendly messages.
- Clamp pagination or limit parameters in services when public routes impose tighter caps (e.g., `Math.min(limit, 50)`).
- Keep orchestration logic here: slug regeneration, image array normalization, event emission, caching hooks, etc.

### 3.7 Controllers

- Parse request bodies with `await c.req.json()` only once; pass the raw object through validators.
- Validate path parameters and query strings with Zod. Throw `ValidationError` for any malformed input to leverage global error handling.
- Return responses through `successResponse`, `paginatedResponse`, or `errorResponse` helpers from `core/http.ts` to keep payloads uniform.
- Do not access the database directly; all persistence goes through services.

### 3.8 Routes & Registration

- Compose routers in `routes.ts` and return `{ router, clientRouter }` (or a single router for auth-only features).
- Apply guards before registering handlers and keep route naming consistent (`/:id`, `/:slug`, `/client`, etc.).
- Register both routers inside `modules/index.ts`, mounting client routes under `/api/v1/<feature>/client` and admin routes under `/api/v1/<feature>`.
- Update `core/container.ts` only when shared services are needed across modules. Most features can stay self-contained.

### 3.9 Response Formatting & Errors

- Use DTO builders from `schema.ts` to shape responses; never expose raw Drizzle rows directly.
- Rely on `AppError` subclasses (`ValidationError`, `NotFoundError`, `ConflictError`, `ForbiddenError`) so the global error handler can map them to status codes.
- For delete operations, return a confirmation payload (`{ message: "..." }`) via `successResponse` to maintain consistency with other modules.

---

## 4. Module Implementation Workflow

1. **Review schema**: Inspect `packages/db/src/schema/<feature>.ts` and any relation helpers to understand tables, constraints, and cascading behavior.
2. **Document plan**: Add or update a module-specific doc in `docs/` (e.g., `docs/services_api.md`) outlining endpoints, DTOs, and edge cases.
3. **Scaffold module folder**: Create files listed in Section 2. Keep naming consistent (`snake-case` directories, camelCase exports).
4. **Write validators**: Compose query and payload schemas. Derive update schemas using partial-update conventions.
5. **Implement repository**: Use shared query helpers, handle relations, and ensure partial updates only mutate provided fields.
6. **Implement service**: Wire business rules, map repository errors, and prepare DTO-ready results.
7. **Implement controller**: Parse inputs, call services, and return standardized responses.
8. **Define routes**: Mount guards, expose admin + client routers, and export them from `routes.ts`.
9. **Bootstrap module**: Instantiate dependencies in `index.ts` and export types/DTOs.
10. **Register routes**: Update `modules/index.ts` to mount admin and client routers.
11. **Run quality checks**: Execute `bun lint`, `bun check-types`, and relevant tests before opening a PR.
12. **Update documentation**: Adjust `README.md`, `docs/...`, and product specs as needed.

---

## 5. Testing, Tooling & Quality Gates

- **Static checks**: Always run `bun lint` and `bun check-types`. These are the minimum gates before any PR.
- **Unit tests**: Once the Bun test runner is wired, colocate specs under `modules/<feature>/__tests__/`. Mock repositories in service tests; use in-memory DB fixtures for repository tests.
- **Integration smoke tests**: Compose the Hono app via `core/app.ts` and hit routes with Bun’s test runner or API clients to verify guards and responses.
- **Formatting**: Run `bun format` when touching files covered by Prettier. ESLint handles unused imports automatically.
- **Docs**: Reflect API changes in module docs, public API references, and changelogs. Keep `docs/update_requests.md` in sync when evolving partial update patterns.

---

## 6. Reference Modules & Supporting Docs

- `apps/server/src/modules/case-studies` — full example with admin CRUD, public feed, image synchronization, and slug handling.
- `apps/server/src/modules/partners` — demonstrates list filtering, public listing, and auto-slug generation.
- `apps/server/src/modules/testimonials` — shows partial updates and public-facing routes with limit clamping.
- `docs/services_api.md` — module-specific plan for services CRUD and public feeds.
- `docs/update_requests.md` — phased approach for enforcing partial-update semantics across modules.
- `docs/backend_arc.md` — architecture blueprint for the backend shell.

Study these references before building new features to avoid re-inventing patterns.

---

## 7. Pull Request Checklist

- [ ] Module follows the structure and responsibilities from Section 2.
- [ ] Validators allow sparse updates and reject empty payloads.
- [ ] Repositories use shared query helpers and sanitize `undefined` fields before updates.
- [ ] Services handle slug uniqueness, derived data, and error translation.
- [ ] Routes expose the correct admin/public surfaces with appropriate guards.
- [ ] Documentation and API references are updated (including public guides if responses change).
- [ ] Linting and type checks pass locally.

Following this guide keeps the API consistent, discoverable, and friendly for future contributors—and ensures new modules integrate smoothly with the existing architecture.
