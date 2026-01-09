/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, inArray, and } from "@suba-company-template/db/orm";
import { contacts, services } from "@suba-company-template/db/schema";

import type {
  CreateContactInput,
  UpdateContactInput,
  ContactsQuery,
  PublicContactsQuery,
  ContactSortField,
} from "./validators";
import { BadRequestError } from "../../core/http";
import type { DbClient } from "../../shared/db";
import { getQueryAPI } from "../../shared/db/relations";
import { mapServiceSummary } from "../../shared/mappers";
import {
  createQueryBuilder,
  countRecords,
  buildListResult,
  combineWhere,
  optionalEq,
} from "../../shared/query";
import { stripUndefinedValues } from "../../shared/utils/object";

const contactQueryBuilder = createQueryBuilder<
  typeof contacts,
  ContactSortField
>({
  table: contacts,
  searchFields: [contacts.fullName, contacts.message],
  sortFields: {
    createdAt: contacts.createdAt,
    fullName: contacts.fullName,
  },
  defaultSortField: "createdAt",
});

export const createContactRepository = (db: DbClient) => {
  return {
    async findAll(query: ContactsQuery) {
      const { page, limit, search, sortBy, sortOrder, isHandled, serviceId } =
        query;

      const whereClause = combineWhere(
        optionalEq(contacts.isHandled, isHandled),
        optionalEq(contacts.serviceId, serviceId),
        contactQueryBuilder.applySearch(search),
      );

      // Get paginated contact IDs
      const baseQuery = db.select({ id: contacts.id }).from(contacts);
      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = contactQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const paginatedIds = (await contactQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      )) as Array<{ id: number }>;

      const contactIdList = paginatedIds.map((row) => row.id);

      // Load hydrated contacts with service
      const items =
        contactIdList.length > 0
          ? await getQueryAPI(db).contacts.findMany({
              where: inArray(contacts.id, contactIdList),
              with: {
                service: true,
              },
            })
          : [];

      // Map items to include service
      const mappedItems = items.map((c: any) => ({
        ...c,
        service: c.service ? mapServiceSummary(c.service) : null,
      }));

      const total = await countRecords(db, contacts, whereClause);

      return buildListResult(mappedItems, total, page, limit);
    },

    async findById(id: number) {
      const result = await getQueryAPI(db).contacts.findFirst({
        where: eq(contacts.id, id),
        with: {
          service: true,
        },
      });

      if (!result) return null;

      return {
        ...result,
        service: result.service ? mapServiceSummary(result.service) : null,
      };
    },

    async create(data: CreateContactInput) {
      // If a serviceId is provided, ensure it exists; otherwise, set it to null
      const serviceId = data.serviceId ?? null;
      if (serviceId !== null) {
        const [serviceExists] = await db
          .select({ id: services.id })
          .from(services)
          .where(eq(services.id, serviceId))
          .limit(1);

        if (!serviceExists) {
          throw new BadRequestError("Selected service does not exist");
        }
      }

      const [newContact] = await db
        .insert(contacts)
        .values({ ...data, serviceId })
        .returning();

      if (!newContact) {
        throw new Error("Failed to create contact");
      }

      return newContact;
    },

    async update(id: number, data: UpdateContactInput) {
      const sanitizedData = stripUndefinedValues(data);

      const [updated] = await db
        .update(contacts)
        .set(sanitizedData)
        .where(eq(contacts.id, id))
        .returning();

      return updated;
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(contacts)
        .where(eq(contacts.id, id))
        .returning();
      return deleted;
    },

    async findPublic(query: PublicContactsQuery) {
      const { page, limit, search, sortBy, sortOrder, serviceId } = query;

      const conditions = [];

      if (serviceId !== undefined) {
        conditions.push(eq(contacts.serviceId, serviceId));
      }

      const searchCondition = contactQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = db
        .select({
          id: contacts.id,
          fullName: contacts.fullName,
          message: contacts.message,
          createdAt: contacts.createdAt,
        })
        .from(contacts);

      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = contactQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const finalQuery = contactQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      );

      const items = await finalQuery;
      const total = await countRecords(db, contacts, whereClause);

      return buildListResult(items, total, page, limit);
    },
  };
};

export type ContactRepository = ReturnType<typeof createContactRepository>;
