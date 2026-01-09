import { createLazyFileRoute } from "@tanstack/react-router";

import ProductCreate from "@/features/dashboard/products/detail/ProductCreate";

export const Route = createLazyFileRoute("/dashboard/products/create")({
  component: ProductCreate,
});
