# Socials dashboard feature

- Data layer: `lib/socials-api.ts`, `lib/socials-query.ts`, `lib/socials-schema.ts` (list params via `createListParamsSchema`; upload constraints: 10MB, image mime types).
- Routing: `/routes/dashboard/socials/index.lazy.tsx` validates search params and prefetches with `socialKeys.list`.
- UI: `index.tsx` uses `useTableFilters` (URL‑synced) + shared `ResourceTable`; `SocialForm` is mode-driven and reuses `useUploadField` for icon validation/preview.
- Mutations: `useCreateSocialMutation`, `useUpdateSocialMutation`, `useDeleteSocialMutation` invalidate `socialKeys.all`.
- To extend: add display columns in `columns.tsx`, adjust schema/types in `lib/socials-schema.ts`, and keep uploads routed through `useUploadField`.
