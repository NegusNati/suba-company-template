import { createBlogController } from "./controller";
import { createBlogRepository } from "./repository";
import { createBlogRoutes } from "./routes";
import { createBlogService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initBlogsModule = (deps: ModuleDeps = { db }) => {
  const repository = createBlogRepository(deps.db);
  const service = createBlogService(repository);
  const controller = createBlogController(service);
  const { router, clientRouter } = createBlogRoutes(controller);

  return { router, clientRouter };
};

export * from "./schema";
export * from "./validators";
