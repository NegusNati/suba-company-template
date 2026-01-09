import { and, eq, sql } from "@suba-company-template/db/orm";
import { socials } from "@suba-company-template/db/schema";

import type {
  CreateSocialInput,
  UpdateSocialInput,
  SocialQuery,
  PublicSocialQuery,
  SocialSortField,
} from "./validators";
import type { DbClient } from "../../shared/db";
import {
  createQueryBuilder,
  countRecords,
  buildListResult,
} from "../../shared/query";
import { stripUndefinedValues } from "../../shared/utils/object";

const socialQueryBuilder = createQueryBuilder<typeof socials, SocialSortField>({
  table: socials,
  searchFields: [socials.title, socials.baseUrl],
  sortFields: {
    id: socials.id,
    title: socials.title,
  },
  defaultSortField: "title",
});

export const createSocialRepository = (db: DbClient) => {
  return {
    async findAll(query: SocialQuery) {
      const { page, limit, search, sortBy, sortOrder } = query;

      const conditions = [];

      const searchCondition = socialQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = db.select().from(socials);
      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = socialQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const finalQuery = socialQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      );

      const items = await finalQuery;
      const total = await countRecords(db, socials, whereClause);

      return buildListResult(items, total, page, limit);
    },

    async findById(id: number) {
      const result = await db
        .select()
        .from(socials)
        .where(eq(socials.id, id))
        .limit(1);
      return result[0] ?? null;
    },

    async findByTitle(title: string) {
      const result = await db
        .select()
        .from(socials)
        .where(sql`lower(${socials.title}) = lower(${title})`)
        .limit(1);
      return result[0] ?? null;
    },

    async create(data: CreateSocialInput) {
      const [created] = await db.insert(socials).values(data).returning();
      if (!created) throw new Error("Failed to create social");
      return created;
    },

    async update(id: number, data: UpdateSocialInput) {
      const sanitizedData = stripUndefinedValues(data);

      const [updated] = await db
        .update(socials)
        .set(sanitizedData)
        .where(eq(socials.id, id))
        .returning();
      return updated;
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(socials)
        .where(eq(socials.id, id))
        .returning();
      return deleted;
    },

    async findPublicList(query: PublicSocialQuery) {
      const { page, limit } = query;

      const baseQuery = db
        .select({
          id: socials.id,
          title: socials.title,
          iconUrl: socials.iconUrl,
          baseUrl: socials.baseUrl,
        })
        .from(socials)
        .orderBy(socials.title);

      const offset = (page - 1) * limit;
      const items = await baseQuery.limit(limit).offset(offset);

      const total = await countRecords(db, socials);

      return buildListResult(items, total, page, limit);
    },
  };
};

export type SocialRepository = ReturnType<typeof createSocialRepository>;
