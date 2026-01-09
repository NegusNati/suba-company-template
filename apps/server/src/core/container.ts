import { db, type DbClient } from "../shared/db";

export interface Container {
  db: DbClient;
}

export const createContainer = (): Container => {
  return {
    db,
  };
};
