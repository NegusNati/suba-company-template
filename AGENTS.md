# Repository Guidelines

## Project Structure & Module Organization

- The monorepo uses Turborepo plus Bun workspaces; run shared commands from the root.
- `apps/web` hosts the Vite + React frontend (routes under `src/routes`, UI in `src/components`).
- `apps/server` contains the Hono API (`src/index.ts`) and expects environment variables in `apps/server/.env`.
- Shared logic lives in `packages/auth` (Better-Auth helpers) and `packages/db` (Drizzle schema, SQL utilities). Schema plans and onboarding notes sit in `docs/`.
- Build outputs (`dist/`, `.turbo/`, `apps/web/dev-dist/`) are ignored by default; keep them out of commits.

## Backend Modular Architecture

### Phase 1 — Baseline Layout

- Place feature domains inside `apps/server/src/modules/` (e.g., `blogs`, `partners`, `services`).
- Each module keeps `controller.ts`, `routes.ts`, `service.ts`, `repository.ts`, `validators.ts`, and an `index.ts` barrel for re-exports.
- Use `apps/server/src/core/` for shared HTTP plumbing: `app.ts`, `router.ts`, `http.ts`, `middleware/`, and `config/` (env parsing with `zod`).
- Keep cross-cutting helpers in `apps/server/src/shared/` such as `db/`, `events/`, `cache/`, `auth/guards`, and DTO mappers.

### Phase 2 — Data Access Integration

- Build module-specific repositories with Drizzle in `repository.ts`, importing tables from `packages/db/src/schema/<feature>.ts`.
- Expose a centralized client from `shared/db/client.ts` and inject it into repositories to enable mocking and testing.
- Capture entity relationship notes near the repository (e.g., `README.md` or `notes.ts`) so contributors understand join expectations like `case_study_images` → `case_studies`.

### Phase 3 — Service & Controller Contracts

- Keep `service.ts` focused on business orchestration: validate inputs, call repositories, emit events, and format domain responses.
- Adapt HTTP concerns inside `controller.ts`, translating Hono `Context` instances, funneling responses through helpers in `core/http.ts`, and handling errors.
- Author `routes.ts` per module to export `register<Feature>` functions that mount controller handlers on provided routers (e.g., `app.route("/blogs", blogsRoutes)`).

### Phase 4 — Validation & Schema Alignment

- Define request validators in `validators.ts` with `zod` schemas (`createBlogSchema`, `updatePartnerSchema`, etc.) that mirror DB columns.
- Publish response DTO types or builders (e.g., `schema.ts`) to avoid exposing raw Drizzle rows and redact internal-only fields.
- Re-export typed factories (`export type BlogRepository = ReturnType<typeof createBlogRepository>`) so dependencies stay explicit.

### Phase 5 — Composition & Bootstrapping

- Aggregate module routers in `modules/index.ts` and expose `registerModules(app: Hono)` for `core/app.ts`.
- Manage dependency wiring inside `core/container.ts`, instantiating repositories, services, cache clients, and config.
- Provide a scaffold script under `scripts/new-module.ts` to generate the module skeleton matching this layout.

### Phase 6 — Testing & Quality Gates

- Create unit tests under `apps/server/src/modules/<feature>/__tests__/` targeting repositories and services with mocked dependencies.
- Spin up integration tests by composing the Hono app through `core/app.ts` with Bun’s test runner, using in-memory DBs or dedicated Docker schemas (`bun db:start`).
- Reflect module onboarding changes in `docs/` as domains evolve so the plan tracks schema updates.

## Build, Test & Development Commands

- `bun install` — Install all workspace dependencies.
- `bun dev`, `bun dev:web`, `bun dev:server` — Start every app or individual targets with watch reload.
- `bun build` — Run Turborepo builds (`bun run --filter <pkg> build` for scoped builds).
- `bun lint`, `bun lint:fix`, `bun format`, `bun format:check` — Enforce ESLint + Prettier rules.
- `bun check-types` — TypeScript project references across apps; pair with `apps/web`’s `bun run check-types` if isolating.
- Database helpers: `bun db:push`, `bun db:studio`, `bun db:start`, `bun db:stop`, `bun db:down` when working inside `packages/db`.

## Coding Style & Naming Conventions

- Write modern TypeScript with ES modules and explicit `import type` when only types are needed.
- Prettier governs formatting (two-space indent, trailing commas, consistent quotes); always run `bun format` before pushing.
- ESLint enforces ordered imports, React hook rules, and removes unused imports automatically (`unused-imports` plugin).
- Prefer PascalCase for React components/files, camelCase for utilities and variables, and kebab-case for route folders.

## API, Query, and Schema Layering

- For dashboard/landing remote data, structure each feature’s `lib/` folder with three focused files: `*Api.ts` for HTTP calls, `*Schema.ts` for Zod validation/types, and `*Query.ts` for React Query hooks and cache keys.
- Reuse the shared axios client and React Query helpers in `apps/web/src/lib/react-query.ts`, and the Better Auth client in `apps/web/src/lib/auth-client.ts` for auth-aware requests.
- Use the app-wide `QueryClient` exported from `apps/web/src/main.tsx` so cache options stay consistent (stale time, retry, auth handling). Avoid creating per-feature clients.
- don't use useEffect as much as posible, use tanstack query hooks to fetch data and update the form state. and other better ways to handle state updates.
- Keep API base paths in `apps/web/src/lib/API_ENDPOINTS.ts`, and co-locate feature-specific params/transformers inside the feature `lib/` folder.
- Build query keys from API endpoint constants plus normalized params (e.g., `[AUTH_API_ENDPOINTS.SERVICES, normalizedParams]`) to keep caching stable; normalize defaults (page/limit/search) before calling `useQuery` to prevent refetch loops. Mutations should set `meta.invalidatesQuery` or call `invalidateQueries` using the same endpoint-based keys.

## Frontend Rich Text Editor

- Use the shared Lexical-based editor in `apps/web/src/components/common/rich-text/LexicalEditor.tsx` (aliased from frontend code as `@/components/common/rich-text/LexicalEditor`) for all rich text inputs.
- Use `LexicalViewer` from `apps/web/src/components/common/rich-text/LexicalViewer.tsx` for read-only rendering of stored rich text HTML.
- Do not introduce new Lexical configurations or ad-hoc editor instances (e.g. under `components/blocks/editor-x`); migrate existing rich text fields to the shared rich text components.

## Testing Guidelines

- Automated tests are not wired up yet; at minimum run `bun check-types` and `bun lint` before every commit.
- When introducing tests, colocate `*.test.ts` files with their modules and expose a matching `bun test` script in the related workspace.
- Use Bun’s test runner or Vitest for unit coverage; clean up database fixtures with `bun db:down`/`db:start` during integration exercises.
- Document any new testing commands in `README.md` and mirror them in package scripts.

## Commit & Pull Request Guidelines

- Write imperative, descriptive commit messages (~50 chars), e.g., `Refine hero metrics cards`; avoid vague one-word summaries.
- Each PR should describe scope, list validation commands, link issues, and attach screenshots or recordings for UI work.
- Call out schema or environment changes explicitly and include required follow-up commands (`bun db:push`, migrations).
- Ensure Husky hooks pass locally before requesting reviews; do not bypass lint or format steps.

## Security & Configuration Tips

- Keep secrets in local `.env` files (`apps/server/.env`); never commit credentials.
- Update `docs/` when adding schema entities or environment variables so future agents align quickly.
- Stop Docker resources after DB work (`bun db:stop`) and verify `.gitignore` covers any new generated artifacts.
