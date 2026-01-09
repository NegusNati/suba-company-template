import { createFileRoute } from "@tanstack/react-router";

import GalleryDetail from "@/features/dashboard/gallery/detail";

export const Route = createFileRoute("/dashboard/gallery/$id/")({
  component: GalleryDetail,
});
