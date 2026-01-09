import { and, eq, isNull } from "@suba-company-template/db/orm";
import { companyMembers } from "@suba-company-template/db/schema";

import type {
  CreateOrgMemberInput,
  UpdateOrgMemberInput,
  OrgQuery,
  PublicOrgQuery,
  OrgSortField,
} from "./validators";
import type { DbClient } from "../../shared/db";
import {
  createQueryBuilder,
  countRecords,
  buildListResult,
} from "../../shared/query";
import { stripUndefinedValues } from "../../shared/utils/object";

const orgQueryBuilder = createQueryBuilder<typeof companyMembers, OrgSortField>(
  {
    table: companyMembers,
    searchFields: [
      companyMembers.firstName,
      companyMembers.lastName,
      companyMembers.title,
    ],
    sortFields: {
      createdAt: companyMembers.createdAt,
      lastName: companyMembers.lastName,
      title: companyMembers.title,
    },
    defaultSortField: "createdAt",
  },
);

export const createOrgRepository = (db: DbClient) => {
  return {
    async findAll(query: OrgQuery) {
      const { page, limit, search, sortBy, sortOrder, managerId, rootOnly } =
        query;

      const conditions = [];
      if (managerId !== undefined) {
        conditions.push(eq(companyMembers.managerId, managerId));
      }
      if (rootOnly) {
        conditions.push(isNull(companyMembers.managerId));
      }

      const searchCondition = orgQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = db
        .select({
          id: companyMembers.id,
          firstName: companyMembers.firstName,
          lastName: companyMembers.lastName,
          title: companyMembers.title,
          headshotUrl: companyMembers.headshotUrl,
          managerId: companyMembers.managerId,
          createdAt: companyMembers.createdAt,
          updatedAt: companyMembers.updatedAt,
        })
        .from(companyMembers);
      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = orgQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const finalQuery = orgQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      );

      const items = await finalQuery;
      const total = await countRecords(db, companyMembers, whereClause);

      return buildListResult(items, total, page, limit);
    },

    async findById(id: number) {
      const result = await db
        .select()
        .from(companyMembers)
        .where(eq(companyMembers.id, id))
        .limit(1);
      return result[0] ?? null;
    },

    async findAllFlat() {
      return await db
        .select({
          id: companyMembers.id,
          firstName: companyMembers.firstName,
          lastName: companyMembers.lastName,
          title: companyMembers.title,
          managerId: companyMembers.managerId,
          headshotUrl: companyMembers.headshotUrl,
        })
        .from(companyMembers);
    },

    async findDirectReports(managerId: number) {
      return await db
        .select()
        .from(companyMembers)
        .where(eq(companyMembers.managerId, managerId));
    },

    async create(data: CreateOrgMemberInput) {
      const [newMember] = await db
        .insert(companyMembers)
        .values(data)
        .returning();

      if (!newMember) {
        throw new Error("Failed to create org member");
      }

      return newMember;
    },

    async update(id: number, data: UpdateOrgMemberInput) {
      const sanitizedData = stripUndefinedValues(data);

      const [updated] = await db
        .update(companyMembers)
        .set({
          ...sanitizedData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(companyMembers.id, id))
        .returning();

      return updated;
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(companyMembers)
        .where(eq(companyMembers.id, id))
        .returning();
      return deleted;
    },

    async updateManagerId(memberId: number, newManagerId: number | null) {
      await db
        .update(companyMembers)
        .set({
          managerId: newManagerId,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(companyMembers.id, memberId));
    },

    async findPublic(query: PublicOrgQuery) {
      const { page, limit, search, sortBy, sortOrder } = query;

      const conditions = [];
      const searchCondition = orgQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = db
        .select({
          id: companyMembers.id,
          firstName: companyMembers.firstName,
          lastName: companyMembers.lastName,
          title: companyMembers.title,
          headshotUrl: companyMembers.headshotUrl,
        })
        .from(companyMembers);

      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = orgQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const finalQuery = orgQueryBuilder.applyPagination(
        sortedQuery,
        page,
        Math.min(limit, 200),
      );

      const items = await finalQuery;
      const total = await countRecords(db, companyMembers, whereClause);

      return buildListResult(items, total, page, Math.min(limit, 200));
    },
  };
};

export type OrgRepository = ReturnType<typeof createOrgRepository>;
