import {
  and,
  eq,
  isNotNull,
  lte,
  desc,
  type SQL,
} from "@suba-company-template/db/orm";
import { partners } from "@suba-company-template/db/schema";

import type {
  CreatePartnerInput,
  UpdatePartnerInput,
  PartnersQuery,
  PublicPartnersQuery,
  PartnerSortField,
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
import { generateSlug, ensureUniqueSlug } from "../../shared/utils/slug";

const partnerQueryBuilder = createQueryBuilder<
  typeof partners,
  PartnerSortField
>({
  table: partners,
  searchFields: [partners.title, partners.description],
  sortFields: {
    createdAt: partners.createdAt,
    title: partners.title,
  },
  defaultSortField: "createdAt",
});

export const createPartnerRepository = (db: DbClient) => {
  return {
    async findAll(query: PartnersQuery) {
      const { page, limit, search, sortBy, sortOrder, onlyWithLogo } = query;

      const conditions = [];
      if (onlyWithLogo) {
        conditions.push(isNotNull(partners.logoUrl));
      }

      const searchCondition = partnerQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = db.select().from(partners);
      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = partnerQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const finalQuery = partnerQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      );

      const items = await finalQuery;
      const total = await countRecords(db, partners, whereClause);

      return buildListResult(items, total, page, limit);
    },

    async findById(id: number) {
      const result = await db
        .select()
        .from(partners)
        .where(eq(partners.id, id))
        .limit(1);
      return result[0] ?? null;
    },

    async findBySlug(slug: string) {
      const result = await db
        .select()
        .from(partners)
        .where(eq(partners.slug, slug))
        .limit(1);
      return result[0] ?? null;
    },

    async create(data: CreatePartnerInput) {
      // Auto-generate slug if not provided
      const slug =
        data.slug ||
        (await ensureUniqueSlug(generateSlug(data.title), async (s) => {
          const existing = await this.findBySlug(s);
          return !!existing;
        }));

      const [newPartner] = await db
        .insert(partners)
        .values({ ...data, slug })
        .returning();

      if (!newPartner) {
        throw new Error("Failed to create partner");
      }

      return newPartner;
    },

    async update(id: number, data: UpdatePartnerInput) {
      const sanitizedData = stripUndefinedValues(data);

      const [updated] = await db
        .update(partners)
        .set({
          ...sanitizedData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(partners.id, id))
        .returning();

      return updated;
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(partners)
        .where(eq(partners.id, id))
        .returning();
      return deleted;
    },

    async findPublic(query: PublicPartnersQuery) {
      const { page, limit, search, onlyWithLogo, sortBy, sortOrder, cursor } =
        query;

      const conditions = [];
      if (onlyWithLogo) {
        conditions.push(isNotNull(partners.logoUrl));
      }

      const searchCondition = partnerQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = db
        .select({
          id: partners.id,
          title: partners.title,
          slug: partners.slug,
          logoUrl: partners.logoUrl,
          websiteUrl: partners.websiteUrl,
          createdAt: partners.createdAt,
        })
        .from(partners);

      const applyFilters = (extraCondition?: SQL) => {
        const combined = combineWhere(whereClause, extraCondition);
        return combined ? baseQuery.where(combined) : baseQuery;
      };

      const cursorValue = decodeCursorValue<string>(cursor);
      let items;
      if (cursorValue) {
        items = await applyFilters(lte(partners.createdAt, cursorValue))
          .orderBy(desc(partners.createdAt))
          .limit(limit);
      } else {
        const filteredQuery = applyFilters();
        const sortedQuery = partnerQueryBuilder.applySort(
          filteredQuery,
          sortBy,
          sortOrder,
        );
        items = await partnerQueryBuilder.applyPagination(
          sortedQuery,
          page,
          limit,
        );
      }
      if (cursorValue) {
        const cursorResult = buildCursorResult(
          items,
          limit,
          (item) => item.createdAt,
        );
        return { ...cursorResult, page, total: undefined };
      }

      const total = await countRecords(db, partners, whereClause);

      return buildListResult(items, total, page, limit);
    },
  };
};

export type PartnerRepository = ReturnType<typeof createPartnerRepository>;
