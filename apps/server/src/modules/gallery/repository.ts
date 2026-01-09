import {
  and,
  eq,
  gte,
  lte,
  desc,
  type SQL,
} from "@suba-company-template/db/orm";
import { galleryItems } from "@suba-company-template/db/schema";

import type {
  CreateGalleryItemInput,
  UpdateGalleryItemInput,
  GalleryQuery,
  PublicGalleryQuery,
  GallerySortField,
} from "./validators";
import type { DbClient } from "../../shared/db";
import {
  createQueryBuilder,
  countRecords,
  buildListResult,
  buildCursorResult,
  decodeCursorValue,
  combineWhere,
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
      } = query;

      const conditions = [];

      const searchCondition = galleryQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      if (occurredAtFrom) {
        conditions.push(gte(galleryItems.occurredAt, occurredAtFrom));
      }
      if (occurredAtTo) {
        conditions.push(lte(galleryItems.occurredAt, occurredAtTo));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = db.select().from(galleryItems);
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

      const items = await finalQuery;
      const total = await countRecords(db, galleryItems, whereClause);

      return buildListResult(items, total, page, limit);
    },

    async findById(id: number) {
      const result = await db
        .select()
        .from(galleryItems)
        .where(eq(galleryItems.id, id))
        .limit(1);
      return result[0] ?? null;
    },

    async create(data: CreateGalleryItemInput) {
      const [created] = await db.insert(galleryItems).values(data).returning();
      if (!created) {
        throw new Error("Failed to create gallery item");
      }
      return created;
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

      return updated;
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
        cursor,
      } = query;

      const conditions = [];

      const searchCondition = galleryQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      if (occurredAtFrom) {
        conditions.push(gte(galleryItems.occurredAt, occurredAtFrom));
      }
      if (occurredAtTo) {
        conditions.push(lte(galleryItems.occurredAt, occurredAtTo));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = db
        .select({
          id: galleryItems.id,
          imageUrl: galleryItems.imageUrl,
          title: galleryItems.title,
          description: galleryItems.description,
          occurredAt: galleryItems.occurredAt,
          createdAt: galleryItems.createdAt,
        })
        .from(galleryItems);

      const applyFilters = (extraCondition?: SQL) => {
        const combined = combineWhere(whereClause, extraCondition);
        return combined ? baseQuery.where(combined) : baseQuery;
      };

      const cursorValue = decodeCursorValue<string>(cursor);
      let paginatedQuery;
      if (cursorValue) {
        paginatedQuery = applyFilters(lte(galleryItems.createdAt, cursorValue))
          .orderBy(desc(galleryItems.createdAt))
          .limit(limit);
      } else {
        const filteredQuery = applyFilters();
        const sortedQuery = galleryQueryBuilder.applySort(
          filteredQuery,
          sortBy,
          sortOrder,
        );
        paginatedQuery = galleryQueryBuilder.applyPagination(
          sortedQuery,
          page,
          limit,
        );
      }

      const items = await paginatedQuery;
      if (cursorValue) {
        const cursorResult = buildCursorResult(
          items,
          limit,
          (item) => item.createdAt,
        );
        return { ...cursorResult, page, total: undefined };
      }

      const total = await countRecords(db, galleryItems, whereClause);

      return buildListResult(items, total, page, limit);
    },
  };
};

export type GalleryRepository = ReturnType<typeof createGalleryRepository>;
