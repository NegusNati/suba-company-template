import { createOrgController } from "./controller";
import { createOrgRepository } from "./repository";
import { createOrgRoutes } from "./routes";
import { createOrgService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initOrgModule = (deps: ModuleDeps = { db }) => {
  const repository = createOrgRepository(deps.db);
  const service = createOrgService(repository);
  const controller = createOrgController(service);
  const { router, clientRouter } = createOrgRoutes(controller);

  return { router, clientRouter };
};

export * from "./schema";
export * from "./validators";
