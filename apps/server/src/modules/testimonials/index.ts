import { createTestimonialController } from "./controller";
import { createTestimonialRepository } from "./repository";
import { createTestimonialRoutes } from "./routes";
import { createTestimonialService } from "./service";
import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";

export const initTestimonialsModule = (deps: ModuleDeps = { db }) => {
  const repository = createTestimonialRepository(deps.db);
  const service = createTestimonialService(repository);
  const controller = createTestimonialController(service);
  const { router, clientRouter } = createTestimonialRoutes(controller);

  return { router, clientRouter };
};

export * from "./schema";
export * from "./validators";
