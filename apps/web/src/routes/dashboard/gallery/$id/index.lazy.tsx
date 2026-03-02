import { createLazyFileRoute } from "@tanstack/react-router";

import GalleryDetail from "@/features/dashboard/gallery/detail";

export const Route = createLazyFileRoute("/dashboard/gallery/$id/")({
  component: GalleryDetail,
});
