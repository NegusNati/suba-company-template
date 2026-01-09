import { createFileRoute } from "@tanstack/react-router";

import EditGalleryItem from "@/features/dashboard/gallery/form/edit-gallery-item";

export const Route = createFileRoute("/dashboard/gallery/$id/edit")({
  component: EditGalleryItem,
});
