import { createLazyFileRoute } from "@tanstack/react-router";

import GalleryDashboard from "@/features/dashboard/gallery";

export const Route = createLazyFileRoute("/dashboard/gallery/categories")({
  component: GalleryCategoriesRoute,
});

function GalleryCategoriesRoute() {
  return <GalleryDashboard initialTab="categories" />;
}
