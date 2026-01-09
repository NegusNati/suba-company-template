import { createPartnerController } from "./controller";
import { createPartnerRepository } from "./repository";
import { createPartnerRoutes } from "./routes";
import { createPartnerService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initPartnersModule = (deps: ModuleDeps = { db }) => {
  const repository = createPartnerRepository(deps.db);
  const service = createPartnerService(repository);
  const controller = createPartnerController(service);
  const { router, clientRouter } = createPartnerRoutes(controller);

  return { router, clientRouter };
};

export type PartnersModule = ReturnType<typeof initPartnersModule>;

export * from "./schema";
export * from "./validators";
