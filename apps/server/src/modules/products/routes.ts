import { Hono } from "hono";

import type { ProductController } from "./controller";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  publicProductQuerySchema,
  productIdParamSchema,
} from "./validators";
import {
  validateBody,
  validateParams,
  validateQuery,
  adminNamespace,
} from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createProductRoutes = (controller: ProductController) => {
  const clientRouter = new Hono();
  clientRouter.get("/", validateQuery(publicProductQuerySchema), (c) =>
    controller.listPublicProducts(c),
  );
  clientRouter.get("/:slug", (c) => controller.getPublicProductBySlug(c));

  const router = new Hono();
  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("admin"));

  router.get("/", validateQuery(productQuerySchema), (c) =>
    controller.listProducts(c),
  );
  router.get("/:id", validateParams(productIdParamSchema), (c) =>
    controller.getProduct(c),
  );
  router.post("/", validateBody(createProductSchema), (c) =>
    controller.createProduct(c),
  );
  router.patch(
    "/:id",
    validateParams(productIdParamSchema),
    validateBody(updateProductSchema),
    (c) => controller.updateProduct(c),
  );
  router.delete("/:id", validateParams(productIdParamSchema), (c) =>
    controller.deleteProduct(c),
  );

  return { router, clientRouter };
};
