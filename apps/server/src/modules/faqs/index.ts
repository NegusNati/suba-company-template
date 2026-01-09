import { createFaqController } from "./controller";
import { createFaqRepository } from "./repository";
import { createFaqRoutes } from "./routes";
import { createFaqService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initFaqsModule = (deps: ModuleDeps = { db }) => {
  const repository = createFaqRepository(deps.db);
  const service = createFaqService(repository);
  const controller = createFaqController(service);
  const { router, clientRouter } = createFaqRoutes(controller);

  return { router, clientRouter };
};

export * from "./schema";
export * from "./validators";
