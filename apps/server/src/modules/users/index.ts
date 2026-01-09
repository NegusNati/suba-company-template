import { createUserController } from "./controller";
import { createUserRepository } from "./repository";
import { createUserRoutes } from "./routes";
import { createUserService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initUsersModule = (deps: ModuleDeps = { db }) => {
  const repository = createUserRepository(deps.db);
  const service = createUserService(repository);
  const controller = createUserController(service);
  const { router } = createUserRoutes(controller);

  return { router };
};

export * from "./schema";
export * from "./validators";
