import { and, eq } from "@suba-company-template/db/orm";
import { faqs } from "@suba-company-template/db/schema";

import type {
  CreateFaqInput,
  UpdateFaqInput,
  FaqQuery,
  PublicFaqQuery,
  FaqSortField,
} from "./validators";
import type { DbClient } from "../../shared/db";
import {
  createQueryBuilder,
  countRecords,
  buildListResult,
} from "../../shared/query";
import { stripUndefinedValues } from "../../shared/utils/object";

const faqQueryBuilder = createQueryBuilder<typeof faqs, FaqSortField>({
  table: faqs,
  searchFields: [faqs.question, faqs.answer],
  sortFields: {
    createdAt: faqs.createdAt,
    question: faqs.question,
  },
  defaultSortField: "createdAt",
});

export const createFaqRepository = (db: DbClient) => {
  return {
    async findAll(query: FaqQuery) {
      const { page, limit, search, sortBy, sortOrder, isActive } = query;

      // Build filters
      const conditions = [];
      if (isActive !== undefined) {
        conditions.push(eq(faqs.isActive, isActive));
      }

      const searchCondition = faqQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Build base query
      const baseQuery = db.select().from(faqs);
      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      // Apply sort and pagination
      const sortedQuery = faqQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const finalQuery = faqQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      );

      const items = await finalQuery;
      const total = await countRecords(db, faqs, whereClause);

      return buildListResult(items, total, page, limit);
    },

    async findById(id: number) {
      const result = await db
        .select()
        .from(faqs)
        .where(eq(faqs.id, id))
        .limit(1);
      return result[0] ?? null;
    },

    async create(data: CreateFaqInput) {
      const [newFaq] = await db.insert(faqs).values(data).returning();

      if (!newFaq) {
        throw new Error("Failed to create FAQ");
      }

      return newFaq;
    },

    async update(id: number, data: UpdateFaqInput) {
      const sanitizedData = stripUndefinedValues(data);

      const [updated] = await db
        .update(faqs)
        .set({
          ...sanitizedData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(faqs.id, id))
        .returning();

      return updated;
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(faqs)
        .where(eq(faqs.id, id))
        .returning();
      return deleted;
    },

    async findPublic(query: PublicFaqQuery) {
      const { page, limit, search, sortBy, sortOrder } = query;

      // Build filters - only active FAQs
      const conditions = [eq(faqs.isActive, true)];

      const searchCondition = faqQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause = and(...conditions);

      // Build base query
      const baseQuery = db
        .select({
          id: faqs.id,
          question: faqs.question,
          answer: faqs.answer,
        })
        .from(faqs);

      const queryWithWhere = baseQuery.where(whereClause);

      // Apply sort and pagination
      const sortedQuery = faqQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const finalQuery = faqQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      );

      const items = await finalQuery;
      const total = await countRecords(db, faqs, whereClause);

      return buildListResult(items, total, page, limit);
    },
  };
};

export type FaqRepository = ReturnType<typeof createFaqRepository>;
