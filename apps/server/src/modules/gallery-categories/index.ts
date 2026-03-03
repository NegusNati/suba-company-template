import { createGalleryCategoryController } from "./controller";
import { createGalleryCategoryRepository } from "./repository";
import { createGalleryCategoryRoutes } from "./routes";
import { createGalleryCategoryService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initGalleryCategoriesModule = (deps: ModuleDeps = { db }) => {
  const repository = createGalleryCategoryRepository(deps.db);
  const service = createGalleryCategoryService(repository);
  const controller = createGalleryCategoryController(service);
  const { router, clientRouter } = createGalleryCategoryRoutes(controller);

  return { router, clientRouter };
};

export * from "./schema";
export * from "./validators";
