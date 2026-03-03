import { createBusinessSectorController } from "./controller";
import { createBusinessSectorRepository } from "./repository";
import { createBusinessSectorRoutes } from "./routes";
import { createBusinessSectorService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initBusinessSectorsModule = (deps: ModuleDeps = { db }) => {
  const repository = createBusinessSectorRepository(deps.db);
  const service = createBusinessSectorService(repository);
  const controller = createBusinessSectorController(service);
  const { router, clientRouter } = createBusinessSectorRoutes(controller);

  return { router, clientRouter };
};

export * from "./schema";
export * from "./validators";
