import { createServiceController } from "./controller";
import { createServiceRepository } from "./repository";
import { createServiceRoutes } from "./routes";
import { createServiceService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initServicesModule = (deps: ModuleDeps = { db }) => {
  const repository = createServiceRepository(deps.db);
  const service = createServiceService(repository);
  const controller = createServiceController(service);
  const { router, clientRouter } = createServiceRoutes(controller);

  return { router, clientRouter };
};

export * from "./schema";
export * from "./validators";
