/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  and,
  eq,
  inArray,
  lte,
  desc,
  type SQL,
} from "@suba-company-template/db/orm";
import { testimonials } from "@suba-company-template/db/schema";

import type {
  CreateTestimonialInput,
  UpdateTestimonialInput,
  TestimonialQuery,
  PublicTestimonialQuery,
  TestimonialSortField,
} from "./validators";
import type { DbClient } from "../../shared/db";
import { getQueryAPI } from "../../shared/db/relations";
import { mapPartnerSummary } from "../../shared/mappers";
import {
  createQueryBuilder,
  countRecords,
  buildListResult,
  buildCursorResult,
  decodeCursorValue,
  combineWhere,
} from "../../shared/query";
import { stripUndefinedValues } from "../../shared/utils/object";

const testimonialQueryBuilder = createQueryBuilder<
  typeof testimonials,
  TestimonialSortField
>({
  table: testimonials,
  searchFields: [
    testimonials.comment,
    testimonials.companyName,
    testimonials.spokePersonName,
    testimonials.spokePersonTitle,
  ],
  sortFields: {
    createdAt: testimonials.createdAt,
    companyName: testimonials.companyName,
  },
  defaultSortField: "createdAt",
});

export const createTestimonialRepository = (db: DbClient) => {
  return {
    async findAll(query: TestimonialQuery) {
      const { page, limit, search, sortBy, sortOrder, partnerId } = query;

      const conditions = [];
      if (partnerId) {
        conditions.push(eq(testimonials.partnerId, partnerId));
      }

      const searchCondition = testimonialQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get paginated testimonial IDs
      const baseQuery = db.select({ id: testimonials.id }).from(testimonials);
      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = testimonialQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const paginatedIds = (await testimonialQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      )) as Array<{ id: number }>;

      const testimonialIdList = paginatedIds.map((row) => row.id);

      // Load hydrated testimonials with partner
      const items =
        testimonialIdList.length > 0
          ? await getQueryAPI(db).testimonials.findMany({
              where: inArray(testimonials.id, testimonialIdList),
              with: {
                partner: true,
              },
            })
          : [];

      // Map items to include partner
      const mappedItems = items.map((t: any) => ({
        ...t,
        partner: t.partner ? mapPartnerSummary(t.partner) : null,
      }));

      const total = await countRecords(db, testimonials, whereClause);

      return buildListResult(mappedItems, total, page, limit);
    },

    async findById(id: number) {
      const result = await getQueryAPI(db).testimonials.findFirst({
        where: eq(testimonials.id, id),
        with: {
          partner: true,
        },
      });

      if (!result) return null;

      return {
        ...result,
        partner: result.partner ? mapPartnerSummary(result.partner) : null,
      };
    },

    async create(data: CreateTestimonialInput) {
      const cleanData = {
        ...data,
        companyLogoUrl: data.companyLogoUrl === "" ? null : data.companyLogoUrl,
        spokePersonHeadshotUrl:
          data.spokePersonHeadshotUrl === ""
            ? null
            : data.spokePersonHeadshotUrl,
      };

      try {
        const [newTestimonial] = await db
          .insert(testimonials)
          .values(cleanData)
          .returning();

        if (!newTestimonial) {
          throw new Error("Failed to create testimonial");
        }

        return this.findById(newTestimonial.id);
      } catch (error: any) {
        if (error.code === "23503") {
          throw new Error("Invalid partner ID");
        }
        throw error;
      }
    },

    async update(id: number, data: UpdateTestimonialInput) {
      const cleanData = {
        ...data,
        companyLogoUrl: data.companyLogoUrl === "" ? null : data.companyLogoUrl,
        spokePersonHeadshotUrl:
          data.spokePersonHeadshotUrl === ""
            ? null
            : data.spokePersonHeadshotUrl,
      };

      const sanitizedData = stripUndefinedValues(cleanData);

      try {
        const [updated] = await db
          .update(testimonials)
          .set({
            ...sanitizedData,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(testimonials.id, id))
          .returning();

        if (!updated) return null;

        return this.findById(updated.id);
      } catch (error: any) {
        if (error.code === "23503") {
          throw new Error("Invalid partner ID");
        }
        throw error;
      }
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(testimonials)
        .where(eq(testimonials.id, id))
        .returning();
      return deleted;
    },

    async findPublic(query: PublicTestimonialQuery) {
      const { page, limit, search, partnerId, sortBy, sortOrder, cursor } =
        query;

      const conditions = [];
      if (partnerId) {
        conditions.push(eq(testimonials.partnerId, partnerId));
      }

      const searchCondition = testimonialQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get paginated testimonial IDs
      const baseQuery = db
        .select({
          id: testimonials.id,
          createdAt: testimonials.createdAt,
        })
        .from(testimonials);
      const applyFilters = (extraCondition?: SQL) => {
        const combined = combineWhere(whereClause, extraCondition);
        return combined ? baseQuery.where(combined) : baseQuery;
      };

      const cursorValue = decodeCursorValue<string>(cursor);
      let paginatedIds: Array<{ id: number }> = [];
      if (cursorValue) {
        paginatedIds = await applyFilters(
          lte(testimonials.createdAt, cursorValue),
        )
          .orderBy(desc(testimonials.createdAt))
          .limit(limit);
      } else {
        const filteredQuery = applyFilters();
        const sortedQuery = testimonialQueryBuilder.applySort(
          filteredQuery,
          sortBy,
          sortOrder,
        );
        paginatedIds = (await testimonialQueryBuilder.applyPagination(
          sortedQuery,
          page,
          limit,
        )) as Array<{ id: number }>;
      }

      const testimonialIdList = paginatedIds.map((row) => row.id);

      // Load hydrated testimonials with partner
      const items =
        testimonialIdList.length > 0
          ? await getQueryAPI(db).testimonials.findMany({
              where: inArray(testimonials.id, testimonialIdList),
              with: {
                partner: true,
              },
            })
          : [];

      // Map items to include partner
      const mappedItems = items.map((t: any) => ({
        ...t,
        partner: t.partner ? mapPartnerSummary(t.partner) : null,
      }));

      if (cursorValue) {
        const cursorResult = buildCursorResult(
          mappedItems,
          limit,
          (item) => item.createdAt,
        );
        return { ...cursorResult, page, total: undefined };
      }

      const total = await countRecords(db, testimonials, whereClause);

      return buildListResult(mappedItems, total, page, limit);
    },
  };
};

export type TestimonialRepository = ReturnType<
  typeof createTestimonialRepository
>;
