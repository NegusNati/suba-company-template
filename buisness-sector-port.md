# Business Sectors Feature Porting Guide (Without Request Form)

Last verified against this repository on **March 2, 2026**.

This guide explains how to copy the **Business Sectors** feature into another app by reusing the same architecture and UI behavior from:

- `apps/web` (landing + dashboard)
- `apps/server` (Hono module)
- `packages/db` (Drizzle schema)

## Scope

Included:

- Business sector CRUD for dashboard
- Public landing list/detail pages
- Stats, services, gallery support
- Featured + service + gallery image uploads
- Publish scheduling (`publishDate`)

Excluded (per your request):

- `business-sector-requests` feature
- Landing `SectorRequestFormSection`
- Dashboard `Sector Requests` screen
- DB table `business_sector_requests`
- `requestFormType` behavior

## 1) Architecture Snapshot

## Data model

Core tables:

- `business_sectors`
- `business_sector_stats`
- `business_sector_services`
- `business_sector_gallery_images`

Relationships:

- `business_sectors (1) -> (*) business_sector_stats`
- `business_sectors (1) -> (*) business_sector_services`
- `business_sectors (1) -> (*) business_sector_gallery_images`

## Server module flow

- Route layer: `apps/server/src/modules/business-sectors/routes.ts`
- Controller layer: `apps/server/src/modules/business-sectors/controller.ts`
- Service layer: `apps/server/src/modules/business-sectors/service.ts`
- Repository layer: `apps/server/src/modules/business-sectors/repository.ts`
- Validation layer: `apps/server/src/modules/business-sectors/validators.ts`

## Web feature flow

Dashboard:

- Feature root: `apps/web/src/features/dashboard/business-sectors/`
- Data contracts: `lib/business-sectors-schema.ts`
- API calls: `lib/business-sectors-api.ts`
- React Query hooks: `lib/business-sectors-query.ts`
- UI form + managers: `components/`

Landing:

- Data contracts: `apps/web/src/features/landing/business-sectors/lib/BusinessSectorsSchema.ts`
- API calls: `.../BusinessSectorsApi.ts`
- Query hooks: `.../BusinessSectorsQuery.ts`
- Listing section: `apps/web/src/features/landing/us-addis/components/OurSectorsSection.tsx`
- Detail page: `apps/web/src/features/landing/us-addis/details/index.tsx`

## 2) Database Design You Should Recreate

Source: `packages/db/src/schema/business-sectors.ts`

Use this shape (without request fields):

```ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const businessSectors = pgTable(
  "business_sectors",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt"),
    history: text("history").notNull(),
    featuredImageUrl: text("featured_image_url"),
    phoneNumber: text("phone_number"),
    emailAddress: text("email_address"),
    address: text("address"),
    facebookUrl: text("facebook_url"),
    instagramUrl: text("instagram_url"),
    linkedinUrl: text("linkedin_url"),
    publishDate: timestamp("publish_date", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    chkSlugFormat: check(
      "chk_business_sectors_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
    idxPublishDate: index("idx_business_sectors_publish_date").on(
      table.publishDate,
    ),
    idxCreatedAt: index("idx_business_sectors_created_at").on(table.createdAt),
  }),
);

export const businessSectorStats = pgTable("business_sector_stats", {
  id: serial("id").primaryKey(),
  sectorId: integer("sector_id")
    .notNull()
    .references(() => businessSectors.id, { onDelete: "cascade" }),
  statKey: text("stat_key").notNull(),
  statValue: text("stat_value").notNull(),
  position: integer("position").default(0).notNull(),
});

export const businessSectorServices = pgTable("business_sector_services", {
  id: serial("id").primaryKey(),
  sectorId: integer("sector_id")
    .notNull()
    .references(() => businessSectors.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  position: integer("position").default(0).notNull(),
});

export const businessSectorGalleryImages = pgTable(
  "business_sector_gallery_images",
  {
    id: serial("id").primaryKey(),
    sectorId: integer("sector_id")
      .notNull()
      .references(() => businessSectors.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    position: integer("position").default(0).notNull(),
  },
);
```

Important:

- Keep `slug` unique and lowercase-hyphen format.
- Keep `publishDate` nullable (draft if null, published if now/past).
- Keep child table ordering by `position`.

## 3) Server API Contract

Admin endpoints (auth + admin role):

- `GET /api/v1/business-sectors`
- `GET /api/v1/business-sectors/:id`
- `GET /api/v1/business-sectors/slug/:slug`
- `POST /api/v1/business-sectors`
- `PATCH /api/v1/business-sectors/:id`
- `DELETE /api/v1/business-sectors/:id`

Public endpoints:

- `GET /api/v1/business-sectors/client`
- `GET /api/v1/business-sectors/client/:id`
- `GET /api/v1/business-sectors/client/slug/:slug`

Public filtering logic (already implemented in `repository.ts`):

- `publishDate IS NOT NULL`
- `publishDate <= CURRENT_TIMESTAMP`

## 4) Server Implementation Notes

## Validation

Source: `apps/server/src/modules/business-sectors/validators.ts`

- Reuse `paginationSchema`, `sortSchema`, `searchSchema`
- Validate slug with `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`
- Validate URLs with `^(https?:\/\/|\/)`
- Parse multipart fields (`stats`, `servicesMeta`, `galleryMeta`) from JSON strings

## Repository behavior

Source: `apps/server/src/modules/business-sectors/repository.ts`

- `findAll` and `findPublished` fetch base sectors first
- Then batch-fetch stats/services/gallery by sector IDs
- Group child rows by `sectorId`
- Return each sector with nested arrays
- `create` inserts sector then nested children
- `update` replaces provided nested arrays (delete + insert)
- `delete` removes sector (children cascade)

Example of update strategy:

```ts
if (services !== undefined) {
  await db
    .delete(businessSectorServices)
    .where(eq(businessSectorServices.sectorId, id));
  if (services.length > 0) {
    await db.insert(businessSectorServices).values(
      services.map((svc, index) => ({
        sectorId: id,
        title: svc.title,
        description: svc.description,
        imageUrl: svc.imageUrl,
        position: svc.position ?? index,
      })),
    );
  }
}
```

## Controller multipart flow

Source: `apps/server/src/modules/business-sectors/controller.ts`

- Detect multipart via `content-type`
- Parse form fields
- Upload files using:
  - `uploadBusinessSectorImage`
  - `uploadBusinessSectorServiceImage`
  - `uploadBusinessSectorGalleryImage`
- Merge uploaded URLs with metadata arrays
- Pass final payload into `createBusinessSectorSchema` / `updateBusinessSectorSchema`

Upload helper source: `apps/server/src/shared/storage/uploadFile.ts`

- Default max size uses `UPLOAD_MAX_BYTES` or `BODY_LIMIT_BYTES` (80MB fallback)
- Returns relative paths like `/uploads/business-sectors/...`

## Route registration

Source: `apps/server/src/modules/index.ts`

Make sure this registration exists:

```ts
{
  name: "business-sectors",
  adminPath: "/api/v1/business-sectors",
  clientPath: "/api/v1/business-sectors/client",
  init: initBusinessSectorsModule,
}
```

## 5) Dashboard UI You Should Rebuild

## Route map

- `/dashboard/business-sectors` list
- `/dashboard/business-sectors/create`
- `/dashboard/business-sectors/$slug` (view)
- `/dashboard/business-sectors/$slug/edit`

Sources:

- `apps/web/src/routes/dashboard/business-sectors/**`

## Data layer pattern

Source folder:

- `apps/web/src/features/dashboard/business-sectors/lib/`

Keep this split exactly:

- `business-sectors-schema.ts` (Zod + types + params normalization)
- `business-sectors-api.ts` (HTTP only)
- `business-sectors-query.ts` (React Query hooks + invalidation)

Key query keys:

```ts
export const businessSectorKeys = {
  all: [DASHBOARD_API_ENDPOINTS.BUSINESS_SECTORS] as const,
  list: (params) =>
    [DASHBOARD_API_ENDPOINTS.BUSINESS_SECTORS, "list", params] as const,
  detail: (id) =>
    [DASHBOARD_API_ENDPOINTS.BUSINESS_SECTORS, "detail", String(id)] as const,
  slug: (slug) =>
    [DASHBOARD_API_ENDPOINTS.BUSINESS_SECTORS, "slug", slug] as const,
};
```

## Form UX structure

Source: `apps/web/src/features/dashboard/business-sectors/components/business-sector-form.tsx`

Main sections:

- Featured image upload
- Basic info (`title`, `excerpt`, `publishDate`)
- History rich text (`LexicalEditor`)
- Stats manager modal list
- Services manager modal list + per-item image upload
- Gallery manager modal list + image upload
- Contact info
- Social links

Managers:

- `SectorStatsManager.tsx`
- `SectorServicesManager.tsx`
- `SectorGalleryManager.tsx`

Important implementation details:

- Uses `useUploadField` for featured image
- Uses state arrays for nested items (`stats`, `services`, `gallery`)
- Reorders items by rewriting `position`
- Sends multipart payload with metadata + files
- Enforces total upload size limit at submit (80MB)

## Multipart request shape from dashboard

Source: `business-sectors-api.ts`

- Plain text fields: `title`, `excerpt`, `history`, etc.
- `stats`: JSON string array
- `servicesMeta`: JSON string array of service metadata
- `services[0]`, `services[1]`: optional files
- `galleryMeta`: JSON string array of gallery metadata
- `gallery[0]`, `gallery[1]`: optional files
- `featuredImage`: optional file

## 6) Landing UI You Should Rebuild

## Route map

- `/us-addis` (sector listing section)
- `/us-addis/$slug` (sector detail page)

Sources:

- `apps/web/src/routes/_landing.us-addis.index.lazy.tsx`
- `apps/web/src/routes/_landing.us-addis.$slug.lazy.tsx`

## Query prefetching

Source: `apps/web/src/routes/_landing.tsx`

- Prefetch sectors in landing layout loader
- Use large limit (`50`) for navbar dropdown + section reuse

```ts
await prefetchLandingBusinessSectorsList(queryClient, {
  limit: 50,
  sortBy: "title",
  sortOrder: "asc",
});
```

## Listing page composition

Source: `apps/web/src/features/landing/us-addis/index.tsx`

Render:

- `AboutTheGroupSection`
- `GroupCollageSection`
- `ChairmanMessageSection`
- `OurSectorsSection` (dynamic cards)

## Detail page composition (without form)

Source: `apps/web/src/features/landing/us-addis/details/index.tsx`

Keep:

- `BreadcrumbNav`
- `CompanyHeroSection`
- `SectorStatsSection`
- `ImageCarouselSection`
- `HistorySection` (with `LexicalViewer`)
- `WhatWeDoSection`
- `CompanyContactSection`

Remove:

- `SectorRequestFormSection`

Minimal no-form detail page snippet:

```tsx
{
  /* remove SectorRequestFormSection */
}
<CompanyContactSection
  phoneNumbers={phoneNumbers}
  email={sector.emailAddress ?? "contact@company.com"}
  address={sector.address ?? ""}
  socialLinks={socialLinks}
/>;
```

## 7) If You Want to Fully Remove Form Artifacts

Because this repo currently contains form-related fields, do this in your new app:

1. Remove `requestFormType` from DB schema (`business_sectors`).
2. Remove any form enums/tables (`business_sector_request_*`, `business_sector_requests`).
3. Remove request module registration from server (`business-sector-requests`).
4. Remove `requestFormType` from:
   - server validators/controller/repository selects
   - dashboard schemas/forms/table column
   - landing schemas/detail props
5. Remove landing component import/export of `SectorRequestFormSection`.
6. Remove `LANDING_API_ENDPOINTS.BUSINESS_SECTOR_REQUESTS_CLIENT` and `DASHBOARD_API_ENDPOINTS.BUSINESS_SECTOR_REQUESTS` from endpoint constants if unused.

## 8) End-to-End Build Order (Recommended)

1. Create Drizzle schema for sector + stats + services + gallery.
2. Add migrations and run DB push/migrate.
3. Build server module (`validators`, `repository`, `service`, `controller`, `routes`, `index`).
4. Register module in `apps/server/src/modules/index.ts`.
5. Add upload helpers and static upload serving.
6. Build dashboard data layer (`Schema`, `Api`, `Query`).
7. Build dashboard list + create/edit/view routes.
8. Build dashboard form + managers.
9. Build landing data layer (`Schema`, `Api`, `Query`).
10. Build listing section and detail page sections.
11. Add landing prefetch for sectors list.
12. Remove request form feature from landing detail and all request modules.

## 9) Testing Checklist

Server:

- Create sector with featured image + nested services/gallery uploads
- Update sector and keep existing images without reuploading
- Public list returns only published sectors
- Slug uniqueness is enforced
- Nested arrays preserve order by `position`

Dashboard:

- Create/edit/delete sector from table actions
- Stats/services/gallery add/edit/delete/reorder
- Upload size validation blocks oversize requests
- View mode renders read-only correctly

Landing:

- Sector cards load from API
- Detail page loads by slug
- Gallery carousel uses `sector.gallery`
- History renders rich text via `LexicalViewer`
- No request form section appears

## 10) Copy-First File Checklist

Copy and adapt these first:

- `packages/db/src/schema/business-sectors.ts`
- `apps/server/src/modules/business-sectors/*`
- `apps/server/src/shared/storage/uploadFile.ts` (business sector upload helpers)
- `apps/web/src/features/dashboard/business-sectors/*`
- `apps/web/src/features/landing/business-sectors/lib/*`
- `apps/web/src/features/landing/us-addis/components/OurSectorsSection.tsx`
- `apps/web/src/features/landing/us-addis/details/*` (exclude `SectorRequestFormSection.tsx`)
- `apps/web/src/routes/dashboard/business-sectors/*`
- `apps/web/src/routes/_landing.tsx`
- `apps/web/src/routes/_landing.us-addis.*`
- `apps/web/src/lib/API_ENDPOINTS.ts`

## 11) Practical Porting Tips

- Keep query keys based on endpoint constants; do not invent custom strings.
- Normalize list params before query calls to avoid refetch loops.
- Keep multipart payload format stable (`servicesMeta` + `services[i]`, `galleryMeta` + `gallery[i]`).
- Keep `publishDate` semantics consistent across dashboard and landing.
- Keep response envelope shape (`success`, `data`, `meta.pagination`) for easier reuse of existing hooks.
