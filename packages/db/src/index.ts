import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://suba:suba_password@localhost:5432/suba_app",
});

export const db = drizzle(pool, { schema });

export type DB = typeof db;
