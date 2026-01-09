import { createSocialController } from "./controller";
import { createSocialRepository } from "./repository";
import { createSocialRoutes } from "./routes";
import { createSocialService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initSocialsModule = (deps: ModuleDeps = { db }) => {
  const repository = createSocialRepository(deps.db);
  const service = createSocialService(repository);
  const controller = createSocialController(service);
  const { router, clientRouter } = createSocialRoutes(controller);

  return { router, clientRouter };
};

export * from "./schema";
export * from "./validators";
