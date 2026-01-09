import { createContactController } from "./controller";
import { createContactRepository } from "./repository";
import { createContactRoutes } from "./routes";
import { createContactService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initContactsModule = (deps: ModuleDeps = { db }) => {
  const repository = createContactRepository(deps.db);
  const service = createContactService(repository);
  const controller = createContactController(service);
  const { router, clientRouter } = createContactRoutes(controller);

  return { router, clientRouter };
};

export * from "./schema";
export * from "./validators";
