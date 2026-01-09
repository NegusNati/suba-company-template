import { and, eq } from "@suba-company-template/db/orm";
import { tags } from "@suba-company-template/db/schema";

import type {
  CreateTagInput,
  UpdateTagInput,
  TagQuery,
  PublicTagQuery,
  TagSortField,
} from "./validators";
import type { DbClient } from "../../shared/db";
import {
  createQueryBuilder,
  countRecords,
  buildListResult,
} from "../../shared/query";
import { stripUndefinedValues } from "../../shared/utils/object";
import { generateSlug, ensureUniqueSlug } from "../../shared/utils/slug";

const tagQueryBuilder = createQueryBuilder<typeof tags, TagSortField>({
  table: tags,
  searchFields: [tags.name],
  sortFields: {
    createdAt: tags.createdAt,
    name: tags.name,
  },
  defaultSortField: "createdAt",
});

export const createTagRepository = (db: DbClient) => {
  return {
    async findAll(query: TagQuery) {
      const { page, limit, search, sortBy, sortOrder } = query;

      const conditions = [];
      const searchCondition = tagQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = db.select().from(tags);
      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = tagQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const finalQuery = tagQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      );

      const items = await finalQuery;
      const total = await countRecords(db, tags, whereClause);

      return buildListResult(items, total, page, limit);
    },

    async findById(id: number) {
      const result = await db
        .select()
        .from(tags)
        .where(eq(tags.id, id))
        .limit(1);
      return result[0] ?? null;
    },

    async findBySlug(slug: string) {
      const result = await db
        .select()
        .from(tags)
        .where(eq(tags.slug, slug))
        .limit(1);
      return result[0] ?? null;
    },

    async create(data: CreateTagInput) {
      // Auto-generate slug if not provided
      const slug =
        data.slug ||
        (await ensureUniqueSlug(generateSlug(data.name), async (s) => {
          const existing = await this.findBySlug(s);
          return !!existing;
        }));

      const [newTag] = await db
        .insert(tags)
        .values({ ...data, slug })
        .returning();

      if (!newTag) {
        throw new Error("Failed to create tag");
      }

      return newTag;
    },

    async update(id: number, data: UpdateTagInput & { slug?: string }) {
      const sanitizedData = stripUndefinedValues(data);

      const [updated] = await db
        .update(tags)
        .set(sanitizedData)
        .where(eq(tags.id, id))
        .returning();

      return updated;
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(tags)
        .where(eq(tags.id, id))
        .returning();
      return deleted;
    },

    async findAllPublic(query: PublicTagQuery) {
      const { page, limit, search, sortBy, sortOrder } = query;

      const conditions = [];
      const searchCondition = tagQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(tags);

      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = tagQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const finalQuery = tagQueryBuilder.applyPagination(
        sortedQuery,
        page,
        Math.min(limit, 100),
      );

      const items = await finalQuery;
      const total = await countRecords(db, tags, whereClause);

      return buildListResult(items, total, page, Math.min(limit, 100));
    },
  };
};

export type TagRepository = ReturnType<typeof createTagRepository>;
