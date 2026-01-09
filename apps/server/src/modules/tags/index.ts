import { createTagController } from "./controller";
import { createTagRepository } from "./repository";
import { createTagRoutes } from "./routes";
import { createTagService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initTagsModule = (deps: ModuleDeps = { db }) => {
  const repository = createTagRepository(deps.db);
  const service = createTagService(repository);
  const controller = createTagController(service);
  const { router, clientRouter } = createTagRoutes(controller);

  return { router, clientRouter };
};

export * from "./schema";
export * from "./validators";
