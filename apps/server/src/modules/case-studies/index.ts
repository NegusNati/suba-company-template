import { createCaseStudyController } from "./controller";
import { createCaseStudyRepository } from "./repository";
import { createCaseStudyRoutes } from "./routes";
import { createCaseStudyService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initCaseStudiesModule = (deps: ModuleDeps = { db }) => {
  const repository = createCaseStudyRepository(deps.db);
  const service = createCaseStudyService(repository);
  const controller = createCaseStudyController(service);
  const { router, clientRouter } = createCaseStudyRoutes(controller);

  return { router, clientRouter };
};

export * from "./schema";
export * from "./validators";
