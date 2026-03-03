import type { Hono } from "hono";

import { initBlogsModule } from "./blogs";
import { initBusinessSectorsModule } from "./business-sectors";
import { initCaseStudiesModule } from "./case-studies";
import { initContactsModule } from "./contacts";
import { initFaqsModule } from "./faqs";
import { initGalleryModule } from "./gallery";
import { initGalleryCategoriesModule } from "./gallery-categories";
import { initOgImageModule } from "./og-image";
import { initOrgModule } from "./org";
import { initPartnersModule } from "./partners";
import { initProductsModule } from "./products";
import { initProfilesModule } from "./profiles";
import { initServicesModule } from "./services";
import { initSocialsModule } from "./socials";
import { initSsrModule } from "./ssr";
import { initTagsModule } from "./tags";
import { initTestimonialsModule } from "./testimonials";
import type { ModuleDeps } from "./types";
import { initUsersModule } from "./users";
import { initVacanciesModule } from "./vacancies";
import type { Container } from "../core/container";
import { logger } from "../shared/logger";

type ModuleInitResult = {
  router?: Hono;
  clientRouter?: Hono;
};

interface ModuleRegistration {
  name: string;
  adminPath?: string;
  clientPath?: string;
  init: (deps: ModuleDeps) => ModuleInitResult;
}

const registrations: ModuleRegistration[] = [
  {
    name: "blogs",
    adminPath: "/api/v1/blogs",
    clientPath: "/api/v1/blogs/client",
    init: initBlogsModule,
  },
  {
    name: "business-sectors",
    adminPath: "/api/v1/business-sectors",
    clientPath: "/api/v1/business-sectors/client",
    init: initBusinessSectorsModule,
  },
  {
    name: "case-studies",
    adminPath: "/api/v1/case-studies",
    clientPath: "/api/v1/case-studies/client",
    init: initCaseStudiesModule,
  },
  {
    name: "contacts",
    adminPath: "/api/v1/contacts",
    clientPath: "/api/v1/contacts/client",
    init: initContactsModule,
  },
  {
    name: "faqs",
    adminPath: "/api/v1/faqs",
    clientPath: "/api/v1/faqs/client",
    init: initFaqsModule,
  },
  {
    name: "partners",
    adminPath: "/api/v1/partners",
    clientPath: "/api/v1/partners/client",
    init: initPartnersModule,
  },
  {
    name: "testimonials",
    adminPath: "/api/v1/testimonials",
    clientPath: "/api/v1/testimonials/client",
    init: initTestimonialsModule,
  },
  {
    name: "org",
    adminPath: "/api/v1/org",
    clientPath: "/api/v1/org/client",
    init: initOrgModule,
  },
  {
    name: "tags",
    adminPath: "/api/v1/tags",
    clientPath: "/api/v1/tags/client",
    init: initTagsModule,
  },
  {
    name: "vacancies",
    adminPath: "/api/v1/vacancies",
    clientPath: "/api/v1/vacancies/client",
    init: initVacanciesModule,
  },
  {
    name: "services",
    adminPath: "/api/v1/services",
    clientPath: "/api/v1/services/client",
    init: initServicesModule,
  },
  {
    name: "products",
    adminPath: "/api/v1/products",
    clientPath: "/api/v1/products/client",
    init: initProductsModule,
  },
  {
    name: "socials",
    adminPath: "/api/v1/socials",
    clientPath: "/api/v1/socials/client",
    init: initSocialsModule,
  },
  {
    name: "gallery",
    adminPath: "/api/v1/gallery",
    clientPath: "/api/v1/gallery/client",
    init: initGalleryModule,
  },
  {
    name: "gallery-categories",
    adminPath: "/api/v1/gallery-categories",
    clientPath: "/api/v1/gallery-categories/client",
    init: initGalleryCategoriesModule,
  },
  {
    name: "profiles",
    adminPath: "/api/v1/profile",
    init: initProfilesModule,
  },
  {
    name: "users",
    adminPath: "/api/v1/users",
    init: initUsersModule,
  },
  {
    name: "og-image",
    clientPath: "/api/og",
    init: initOgImageModule,
  },
  {
    name: "ssr",
    clientPath: "/_ssr",
    init: initSsrModule,
  },
];

const apiPrefix = "/api/v1";

const buildPath = (path: string): string => {
  // Don't transform paths that don't start with /api (like /_ssr)
  if (!path.startsWith("/api")) {
    return path;
  }
  return path.startsWith(apiPrefix) ? path : path.replace(/^\/api/, apiPrefix);
};

export const registerModules = (app: Hono, container: Container) => {
  const deps: ModuleDeps = { db: container.db };

  registrations.forEach(({ adminPath, clientPath, init, name }) => {
    const { router, clientRouter } = init(deps);

    // Register client routes FIRST to ensure they take precedence over parametric admin routes
    // e.g., /api/v1/testimonials/client must match before /api/v1/testimonials/:id
    if (clientPath && clientRouter) {
      app.route(buildPath(clientPath), clientRouter);
    }
    if (adminPath && router) {
      app.route(buildPath(adminPath), router);
    }

    if (!router && !clientRouter) {
      logger.warn(`[modules] "${name}" did not return any routers; skipped`);
    }
  });
};
