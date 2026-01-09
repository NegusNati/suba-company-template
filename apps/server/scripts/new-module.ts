#!/usr/bin/env bun
/* eslint-disable no-console */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const moduleName = process.argv[2];

if (!moduleName) {
  console.error("Usage: bun scripts/new-module.ts <module-name>");
  console.error("Example: bun scripts/new-module.ts partners");
  process.exit(1);
}

const pascalCase = (str: string) =>
  str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

const modulePath = join(import.meta.dir, "..", "src", "modules", moduleName);

const entityName = pascalCase(moduleName);

const templates = {
  "schema.ts": `import { z } from "zod";

export const ${moduleName}ResponseSchema = z.object({
  id: z.number(),
  // Add your schema fields here
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ${entityName}Response = z.infer<typeof ${moduleName}ResponseSchema>;
`,

  "validators.ts": `import { z } from "zod";

export const create${entityName}Schema = z.object({
  // Add your validation fields here
});

export const update${entityName}Schema = create${entityName}Schema.partial();

export const ${moduleName}QuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
});

export type Create${entityName}Input = z.infer<typeof create${entityName}Schema>;
export type Update${entityName}Input = z.infer<typeof update${entityName}Schema>;
export type ${entityName}Query = z.infer<typeof ${moduleName}QuerySchema>;
`,

  "repository.ts": `import { eq, sql } from "drizzle-orm";
import type { DbClient } from "../../shared/db";
import { ${moduleName} } from "@suba-company-template/db/schema";
import type { Create${entityName}Input, Update${entityName}Input } from "./validators";

export const create${entityName}Repository = (db: DbClient) => {
  return {
    async findAll(options?: { page?: number; limit?: number }) {
      const page = options?.page ?? 1;
      const limit = options?.limit ?? 10;
      const offset = (page - 1) * limit;

      return await db
        .select()
        .from(${moduleName})
        .limit(limit)
        .offset(offset);
    },

    async findById(id: number) {
      const result = await db
        .select()
        .from(${moduleName})
        .where(eq(${moduleName}.id, id))
        .limit(1);
      return result[0] ?? null;
    },

    async create(data: Create${entityName}Input) {
      const [created] = await db.insert(${moduleName}).values(data).returning();
      return created;
    },

    async update(id: number, data: Update${entityName}Input) {
      const [updated] = await db
        .update(${moduleName})
        .set({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(${moduleName}.id, id))
        .returning();
      return updated;
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(${moduleName})
        .where(eq(${moduleName}.id, id))
        .returning();
      return deleted;
    },

    async count() {
      const result = await db
        .select({ count: sql<number>\`count(*)\` })
        .from(${moduleName});
      return result[0]?.count ?? 0;
    },
  };
};

export type ${entityName}Repository = ReturnType<typeof create${entityName}Repository>;
`,

  "service.ts": `import type { ${entityName}Repository } from "./repository";
import type { Create${entityName}Input, Update${entityName}Input, ${entityName}Query } from "./validators";
import { NotFoundError } from "../../core/http";

export const create${entityName}Service = (repository: ${entityName}Repository) => {
  return {
    async get${entityName}s(query: ${entityName}Query) {
      const page = parseInt(query.page);
      const limit = parseInt(query.limit);

      const [items, total] = await Promise.all([
        repository.findAll({ page, limit }),
        repository.count(),
      ]);

      return {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    },

    async get${entityName}ById(id: number) {
      const item = await repository.findById(id);
      if (!item) {
        throw new NotFoundError(\`${entityName} with id \${id} not found\`);
      }
      return item;
    },

    async create${entityName}(data: Create${entityName}Input) {
      return await repository.create(data);
    },

    async update${entityName}(id: number, data: Update${entityName}Input) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(\`${entityName} with id \${id} not found\`);
      }
      return await repository.update(id, data);
    },

    async delete${entityName}(id: number) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(\`${entityName} with id \${id} not found\`);
      }
      return await repository.delete(id);
    },
  };
};

export type ${entityName}Service = ReturnType<typeof create${entityName}Service>;
`,

  "controller.ts": `import type { Context } from "hono";
import type { ${entityName}Service } from "./service";
import {
  create${entityName}Schema,
  update${entityName}Schema,
  ${moduleName}QuerySchema,
} from "./validators";
import { successResponse, ValidationError } from "../../core/http";

export const create${entityName}Controller = (service: ${entityName}Service) => {
  return {
    async list${entityName}s(c: Context) {
      const query = ${moduleName}QuerySchema.parse({
        page: c.req.query("page"),
        limit: c.req.query("limit"),
      });

      const result = await service.get${entityName}s(query);
      return successResponse(c, result);
    },

    async get${entityName}(c: Context) {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        throw new ValidationError("Invalid ${moduleName} ID");
      }

      const item = await service.get${entityName}ById(id);
      return successResponse(c, item);
    },

    async create${entityName}(c: Context) {
      const body = await c.req.json();
      const data = create${entityName}Schema.parse(body);

      const item = await service.create${entityName}(data);
      return successResponse(c, item, 201);
    },

    async update${entityName}(c: Context) {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        throw new ValidationError("Invalid ${moduleName} ID");
      }

      const body = await c.req.json();
      const data = update${entityName}Schema.parse(body);

      const item = await service.update${entityName}(id, data);
      return successResponse(c, item);
    },

    async delete${entityName}(c: Context) {
      const id = parseInt(c.req.param("id"));
      if (isNaN(id)) {
        throw new ValidationError("Invalid ${moduleName} ID");
      }

      await service.delete${entityName}(id);
      return successResponse(c, { message: "${entityName} deleted successfully" });
    },
  };
};

export type ${entityName}Controller = ReturnType<typeof create${entityName}Controller>;
`,

  "routes.ts": `import { Hono } from "hono";
import type { ${entityName}Controller } from "./controller";

export const create${entityName}Routes = (controller: ${entityName}Controller) => {
  const router = new Hono();

  router.get("/", (c) => controller.list${entityName}s(c));
  router.get("/:id", (c) => controller.get${entityName}(c));
  router.post("/", (c) => controller.create${entityName}(c));
  router.patch("/:id", (c) => controller.update${entityName}(c));
  router.delete("/:id", (c) => controller.delete${entityName}(c));

  return router;
};
`,

  "index.ts": `import { db } from "../../shared/db";
import type { ModuleDeps } from "../types";
import { create${entityName}Repository } from "./repository";
import { create${entityName}Service } from "./service";
import { create${entityName}Controller } from "./controller";
import { create${entityName}Routes } from "./routes";

export const init${entityName}Module = (deps: ModuleDeps = { db }) => {
  const repository = create${entityName}Repository(deps.db);
  const service = create${entityName}Service(repository);
  const controller = create${entityName}Controller(service);
  const router = create${entityName}Routes(controller);

  return { router };
};

export * from "./schema";
export * from "./validators";
`,
};

async function createModule() {
  console.log(`Creating module: ${moduleName}`);

  try {
    await mkdir(modulePath, { recursive: true });

    for (const [filename, content] of Object.entries(templates)) {
      const filePath = join(modulePath, filename);
      await writeFile(filePath, content, "utf-8");
      console.log(`✓ Created ${filename}`);
    }

    console.log(`\n✅ Module "${moduleName}" created successfully!`);
    console.log(`\nNext steps:`);
    console.log(`1. Update the schema in src/modules/${moduleName}/schema.ts`);
    console.log(
      `2. Update the validators in src/modules/${moduleName}/validators.ts`,
    );
    console.log(
      `3. Customize the repository in src/modules/${moduleName}/repository.ts`,
    );
    console.log(
      `4. Register the module in src/modules/index.ts:\n   app.route("/api/v1/${moduleName}", init${entityName}Module(deps).router);`,
    );
  } catch (error) {
    console.error("Error creating module:", error);
    process.exit(1);
  }
}

createModule();
