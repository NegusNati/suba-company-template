import { createLazyFileRoute } from "@tanstack/react-router";

import { GalleryPage } from "@/features/gallery";

export const Route = createLazyFileRoute("/demo/gallery/")({
  component: GalleryRoute,
});

function GalleryRoute() {
  return <GalleryPage />;
}
