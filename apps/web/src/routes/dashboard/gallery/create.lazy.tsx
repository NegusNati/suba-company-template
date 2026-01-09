import { createLazyFileRoute } from "@tanstack/react-router";

import CreateGalleryItem from "@/features/dashboard/gallery/form/create-gallery-item";

export const Route = createLazyFileRoute("/dashboard/gallery/create")({
  component: CreateGalleryItem,
});
