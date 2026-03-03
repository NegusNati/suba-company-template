import {
  desc,
  eq,
  gte,
  lte,
  sql,
  type SQL,
} from "@suba-company-template/db/orm";
import {
  galleryCategories,
  galleryItems,
} from "@suba-company-template/db/schema";

import type {
  CreateGalleryItemInput,
  GalleryQuery,
  GallerySortField,
  PublicGalleryQuery,
  UpdateGalleryItemInput,
} from "./validators";
import type { DbClient } from "../../shared/db";
import {
  buildCursorResult,
  buildListResult,
  combineWhere,
  createQueryBuilder,
  decodeCursorValue,
} from "../../shared/query";
import { stripUndefinedValues } from "../../shared/utils/object";

const galleryQueryBuilder = createQueryBuilder<
  typeof galleryItems,
  GallerySortField
>({
  table: galleryItems,
  searchFields: [galleryItems.title, galleryItems.description],
  sortFields: {
    createdAt: galleryItems.createdAt,
    occurredAt: galleryItems.occurredAt,
    title: galleryItems.title,
  },
  defaultSortField: "occurredAt",
});

type GalleryItemWithCategoryRow = {
  id: number;
  imageUrls: string[];
  title: string;
  description: string | null;
  occurredAt: string | null;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
};

const selectGalleryItemWithCategory = {
  id: galleryItems.id,
  imageUrls: galleryItems.imageUrls,
  title: galleryItems.title,
  description: galleryItems.description,
  occurredAt: galleryItems.occurredAt,
  createdAt: galleryItems.createdAt,
  updatedAt: galleryItems.updatedAt,
  categoryId: galleryCategories.id,
  categoryName: galleryCategories.name,
  categorySlug: galleryCategories.slug,
};

const mapGalleryItem = (row: GalleryItemWithCategoryRow) => ({
  id: row.id,
  imageUrls: row.imageUrls,
  coverImageUrl: row.imageUrls[0] ?? null,
  imageCount: row.imageUrls.length,
  title: row.title,
  description: row.description,
  occurredAt: row.occurredAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  category: {
    id: row.categoryId,
    name: row.categoryName,
    slug: row.categorySlug,
  },
});

const countGalleryItems = async (db: DbClient, whereClause?: SQL) => {
  const query = db
    .select({ count: sql<number>`count(*)` })
    .from(galleryItems)
    .innerJoin(
      galleryCategories,
      eq(galleryItems.categoryId, galleryCategories.id),
    );

  const rows = whereClause ? await query.where(whereClause) : await query;
  return Number(rows[0]?.count ?? 0);
};

export const createGalleryRepository = (db: DbClient) => {
  return {
    async findAll(query: GalleryQuery) {
      const {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        occurredAtFrom,
        occurredAtTo,
        categoryId,
      } = query;

      const searchCondition = galleryQueryBuilder.applySearch(search);
      const whereClause = combineWhere(
        searchCondition,
        occurredAtFrom
          ? gte(galleryItems.occurredAt, occurredAtFrom)
          : undefined,
        occurredAtTo ? lte(galleryItems.occurredAt, occurredAtTo) : undefined,
        categoryId ? eq(galleryItems.categoryId, categoryId) : undefined,
      );

      const baseQuery = db
        .select(selectGalleryItemWithCategory)
        .from(galleryItems)
        .innerJoin(
          galleryCategories,
          eq(galleryItems.categoryId, galleryCategories.id),
        );

      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = galleryQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const finalQuery = galleryQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      );

      const rows =
        (await finalQuery) as unknown as GalleryItemWithCategoryRow[];
      const items = rows.map(mapGalleryItem);
      const total = await countGalleryItems(db, whereClause);

      return buildListResult(items, total, page, limit);
    },

    async findById(id: number) {
      const rows = (await db
        .select(selectGalleryItemWithCategory)
        .from(galleryItems)
        .innerJoin(
          galleryCategories,
          eq(galleryItems.categoryId, galleryCategories.id),
        )
        .where(eq(galleryItems.id, id))
        .limit(1)) as unknown as GalleryItemWithCategoryRow[];

      const row = rows[0];
      return row ? mapGalleryItem(row) : null;
    },

    async create(data: CreateGalleryItemInput) {
      const [created] = await db.insert(galleryItems).values(data).returning();
      if (!created) {
        throw new Error("Failed to create gallery item");
      }

      return this.findById(created.id);
    },

    async update(id: number, data: UpdateGalleryItemInput) {
      const sanitizedData = stripUndefinedValues({
        ...data,
        updatedAt: new Date().toISOString(),
      });

      const [updated] = await db
        .update(galleryItems)
        .set(sanitizedData)
        .where(eq(galleryItems.id, id))
        .returning();

      if (!updated) {
        return null;
      }

      return this.findById(id);
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(galleryItems)
        .where(eq(galleryItems.id, id))
        .returning();
      return deleted;
    },

    async findPublicList(query: PublicGalleryQuery) {
      const {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        occurredAtFrom,
        occurredAtTo,
        categorySlug,
        cursor,
      } = query;

      const searchCondition = galleryQueryBuilder.applySearch(search);
      const whereClause = combineWhere(
        searchCondition,
        occurredAtFrom
          ? gte(galleryItems.occurredAt, occurredAtFrom)
          : undefined,
        occurredAtTo ? lte(galleryItems.occurredAt, occurredAtTo) : undefined,
        categorySlug ? eq(galleryCategories.slug, categorySlug) : undefined,
      );

      const baseQuery = db
        .select(selectGalleryItemWithCategory)
        .from(galleryItems)
        .innerJoin(
          galleryCategories,
          eq(galleryItems.categoryId, galleryCategories.id),
        );

      const applyFilters = (extraCondition?: SQL) => {
        const combined = combineWhere(whereClause, extraCondition);
        return combined ? baseQuery.where(combined) : baseQuery;
      };

      const cursorValue = decodeCursorValue<string>(cursor);

      if (cursorValue) {
        const rows = (await applyFilters(
          lte(galleryItems.createdAt, cursorValue),
        )
          .orderBy(desc(galleryItems.createdAt))
          .limit(limit)) as unknown as GalleryItemWithCategoryRow[];

        const items = rows.map(mapGalleryItem);
        const cursorResult = buildCursorResult(
          items,
          limit,
          (item) => item.createdAt,
        );
        return { ...cursorResult, page, total: undefined };
      }

      const filteredQuery = applyFilters();
      const sortedQuery = galleryQueryBuilder.applySort(
        filteredQuery,
        sortBy,
        sortOrder,
      );
      const paginatedQuery = galleryQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      );

      const rows =
        (await paginatedQuery) as unknown as GalleryItemWithCategoryRow[];
      const items = rows.map(mapGalleryItem);
      const total = await countGalleryItems(db, whereClause);

      return buildListResult(items, total, page, limit);
    },
  };
};

export type GalleryRepository = ReturnType<typeof createGalleryRepository>;
