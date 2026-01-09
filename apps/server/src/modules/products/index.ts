import { createProductController } from "./controller";
import { createProductRepository } from "./repository";
import { createProductRoutes } from "./routes";
import { createProductService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initProductsModule = (deps: ModuleDeps = { db }) => {
  const repository = createProductRepository(deps.db);
  const service = createProductService(repository);
  const controller = createProductController(service);
  const { router, clientRouter } = createProductRoutes(controller);

  return { router, clientRouter };
};

export * from "./schema";
export * from "./validators";
