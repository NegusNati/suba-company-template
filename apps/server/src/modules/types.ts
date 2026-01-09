import type { DbClient } from "../shared/db";

export interface ModuleDeps {
  db: DbClient;
}
