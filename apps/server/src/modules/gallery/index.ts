import { createGalleryController } from "./controller";
import { createGalleryRepository } from "./repository";
import { createGalleryRoutes } from "./routes";
import { createGalleryService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initGalleryModule = (deps: ModuleDeps = { db }) => {
  const repository = createGalleryRepository(deps.db);
  const service = createGalleryService(repository);
  const controller = createGalleryController(service);
  const { router, clientRouter } = createGalleryRoutes(controller);

  return { router, clientRouter };
};

export * from "./schema";
export * from "./validators";
