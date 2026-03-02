import { createLazyFileRoute } from "@tanstack/react-router";

import EditGalleryItem from "@/features/dashboard/gallery/form/edit-gallery-item";

export const Route = createLazyFileRoute("/dashboard/gallery/$id/edit")({
  component: EditGalleryItem,
});
