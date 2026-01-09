import { createVacancyController } from "./controller";
import { createVacancyRepository } from "./repository";
import { createVacancyRoutes } from "./routes";
import { createVacancyService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initVacanciesModule = (deps: ModuleDeps = { db }) => {
  const repository = createVacancyRepository(deps.db);
  const service = createVacancyService(repository);
  const controller = createVacancyController(service);
  const { router, clientRouter } = createVacancyRoutes(controller);

  return { router, clientRouter };
};

export * from "./schema";
export * from "./validators";
