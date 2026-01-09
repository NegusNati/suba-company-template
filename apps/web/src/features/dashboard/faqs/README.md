# FAQs dashboard feature

- Data layer: `lib/faqs-api.ts`, `lib/faqs-query.ts`, `lib/faqs-schema.ts` (list params normalized with `createListParamsSchema` + `normalizeListParams`).
- Routing: `/routes/dashboard/faqs/index.lazy.tsx` validates search params and prefetches via `prefetchResource` + `faqKeys.list`.
- UI: `index.tsx` uses `useTableFilters` (URL‑synced) + shared `ResourceTable`; forms handled by `FaqForm` (mode-driven create/edit/view).
- Mutations: `useCreateFaqMutation`, `useUpdateFaqMutation`, `useDeleteFaqMutation` invalidate `faqKeys.all`.
- To extend: add columns in `columns.tsx`, update schema/types in `lib/faqs-schema.ts`, and reuse `FaqForm` for new fields.
