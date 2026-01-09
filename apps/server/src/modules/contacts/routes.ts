import { Hono } from "hono";

import type { ContactController } from "./controller";
import {
  createContactSchema,
  updateContactSchema,
  contactsQuerySchema,
  publicContactsQuerySchema,
  contactIdParamSchema,
} from "./validators";
import {
  validateBody,
  validateParams,
  validateQuery,
  adminNamespace,
} from "../../core/middleware";
import { requireAuth, requireRole } from "../../shared/auth/guards";

export const createContactRoutes = (controller: ContactController) => {
  const clientRouter = new Hono();

  clientRouter.post("/", validateBody(createContactSchema), (c) =>
    controller.createContact(c),
  );
  clientRouter.get("/", validateQuery(publicContactsQuerySchema), (c) =>
    controller.listPublicContacts(c),
  );

  const router = new Hono();

  router.use("/*", adminNamespace);
  router.use("/*", requireAuth);
  router.use("/*", requireRole("admin"));

  router.get("/", validateQuery(contactsQuerySchema), (c) =>
    controller.listContacts(c),
  );
  router.get("/:id", validateParams(contactIdParamSchema), (c) =>
    controller.getContact(c),
  );
  router.patch(
    "/:id",
    validateParams(contactIdParamSchema),
    validateBody(updateContactSchema),
    (c) => controller.updateContact(c),
  );
  router.delete("/:id", validateParams(contactIdParamSchema), (c) =>
    controller.deleteContact(c),
  );

  return { router, clientRouter };
};
