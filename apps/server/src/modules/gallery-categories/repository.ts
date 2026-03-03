import { and, eq, inArray, sql, type SQL } from "@suba-company-template/db/orm";
import {
  galleryCategories,
  galleryItems,
} from "@suba-company-template/db/schema";

import type {
  CreateGalleryCategoryInput,
  GalleryCategoryQuery,
  GalleryCategorySortField,
  PublicGalleryCategoryQuery,
  UpdateGalleryCategoryInput,
} from "./validators";
import type { DbClient } from "../../shared/db";
import {
  buildListResult,
  countRecords,
  createQueryBuilder,
} from "../../shared/query";
import { stripUndefinedValues } from "../../shared/utils/object";

const galleryCategoryQueryBuilder = createQueryBuilder<
  typeof galleryCategories,
  GalleryCategorySortField
>({
  table: galleryCategories,
  searchFields: [galleryCategories.name],
  sortFields: {
    createdAt: galleryCategories.createdAt,
    name: galleryCategories.name,
  },
  defaultSortField: "createdAt",
});

const mapItemCounts = async (db: DbClient, categoryIds: number[]) => {
  if (categoryIds.length === 0) {
    return new Map<number, number>();
  }

  const counts = await db
    .select({
      categoryId: galleryItems.categoryId,
      count: sql<number>`count(*)`,
    })
    .from(galleryItems)
    .where(inArray(galleryItems.categoryId, categoryIds))
    .groupBy(galleryItems.categoryId);

  return new Map(
    counts.map((entry) => [Number(entry.categoryId), Number(entry.count)]),
  );
};

export const createGalleryCategoryRepository = (db: DbClient) => {
  return {
    async findAll(query: GalleryCategoryQuery) {
      const { page, limit, search, sortBy, sortOrder } = query;

      const conditions: SQL[] = [];
      const searchCondition = galleryCategoryQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = db.select().from(galleryCategories);
      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = galleryCategoryQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const finalQuery = galleryCategoryQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      );

      const items = await finalQuery;
      const total = await countRecords(db, galleryCategories, whereClause);
      const counts = await mapItemCounts(
        db,
        items.map((item) => item.id),
      );

      const withCounts = items.map((item) => ({
        ...item,
        itemCount: counts.get(item.id) ?? 0,
      }));

      return buildListResult(withCounts, total, page, limit);
    },

    async findById(id: number) {
      const rows = await db
        .select()
        .from(galleryCategories)
        .where(eq(galleryCategories.id, id))
        .limit(1);
      return rows[0] ?? null;
    },

    async findBySlug(slug: string) {
      const rows = await db
        .select()
        .from(galleryCategories)
        .where(eq(galleryCategories.slug, slug))
        .limit(1);
      return rows[0] ?? null;
    },

    async findUncategorized() {
      return this.findBySlug("uncategorized");
    },

    async create(data: CreateGalleryCategoryInput & { slug: string }) {
      const [created] = await db
        .insert(galleryCategories)
        .values(data)
        .returning();

      if (!created) {
        throw new Error("Failed to create gallery category");
      }

      return created;
    },

    async update(
      id: number,
      data: UpdateGalleryCategoryInput & { slug?: string },
    ) {
      const sanitized = stripUndefinedValues({
        ...data,
        updatedAt: new Date().toISOString(),
      });

      const [updated] = await db
        .update(galleryCategories)
        .set(sanitized)
        .where(eq(galleryCategories.id, id))
        .returning();

      return updated;
    },

    async reassignItemsAndDelete(id: number, targetCategoryId: number) {
      return db.transaction(async (tx) => {
        await tx
          .update(galleryItems)
          .set({
            categoryId: targetCategoryId,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(galleryItems.categoryId, id));

        const [deleted] = await tx
          .delete(galleryCategories)
          .where(eq(galleryCategories.id, id))
          .returning();

        return deleted;
      });
    },

    async countItems(categoryId: number) {
      const rows = await db
        .select({ count: sql<number>`count(*)` })
        .from(galleryItems)
        .where(eq(galleryItems.categoryId, categoryId));

      return Number(rows[0]?.count ?? 0);
    },

    async findAllPublic(query: PublicGalleryCategoryQuery) {
      const { page, limit, search, sortBy, sortOrder } = query;

      const conditions: SQL[] = [];
      const searchCondition = galleryCategoryQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = db.select().from(galleryCategories);
      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = galleryCategoryQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const finalQuery = galleryCategoryQueryBuilder.applyPagination(
        sortedQuery,
        page,
        Math.min(limit, 100),
      );

      const items = await finalQuery;
      const total = await countRecords(db, galleryCategories, whereClause);
      const counts = await mapItemCounts(
        db,
        items.map((item) => item.id),
      );

      const withCounts = items.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        itemCount: counts.get(item.id) ?? 0,
      }));

      return buildListResult(withCounts, total, page, Math.min(limit, 100));
    },
  };
};

export type GalleryCategoryRepository = ReturnType<
  typeof createGalleryCategoryRepository
>;
