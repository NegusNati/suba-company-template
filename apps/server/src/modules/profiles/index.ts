import { createProfileController } from "./controller";
import { createProfileRepository } from "./repository";
import { createProfileRoutes } from "./routes";
import { createProfileService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initProfilesModule = (deps: ModuleDeps = { db }) => {
  const repository = createProfileRepository(deps.db);
  const service = createProfileService(repository);
  const controller = createProfileController(service);
  const routes = createProfileRoutes(controller);

  return { router: routes };
};

export * from "./schema";
export * from "./validators";
