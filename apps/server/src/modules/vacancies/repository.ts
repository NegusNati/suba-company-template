import {
  and,
  eq,
  gt,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "@suba-company-template/db/orm";
import { tags } from "@suba-company-template/db/schema/tags";
import {
  vacancies,
  vacancyApplications,
  vacancyTags,
} from "@suba-company-template/db/schema/vacancies";

import type {
  CreateVacancyApplicationInput,
  CreateVacancyInput,
  PublicVacancyQuery,
  PublicVacancySortField,
  UpdateVacancyApplicationInput,
  UpdateVacancyInput,
  VacancyApplicationQuery,
  VacancyApplicationSortField,
  VacancyQuery,
  VacancySortField,
} from "./validators";
import type { DbClient } from "../../shared/db";
import { mapTagList } from "../../shared/mappers";
import {
  countRecords,
  buildListResult,
  createQueryBuilder,
} from "../../shared/query";
import { stripUndefinedValues } from "../../shared/utils/object";

type CreateVacancyRepositoryInput = Omit<
  CreateVacancyInput,
  "status" | "publishedAt" | "deadlineAt"
> & {
  slug: string;
  status: NonNullable<CreateVacancyInput["status"]>;
  createdByUserId: string;
  publishedAt?: string | null;
  deadlineAt?: string | null;
};

type UpdateVacancyRepositoryInput = Omit<
  UpdateVacancyInput,
  "publishedAt" | "deadlineAt"
> & {
  slug?: string;
  tagIds?: number[];
  publishedAt?: string | null;
  deadlineAt?: string | null;
};

const vacancyQueryBuilder = createQueryBuilder<
  typeof vacancies,
  VacancySortField
>({
  table: vacancies,
  searchFields: [
    vacancies.title,
    vacancies.excerpt,
    vacancies.department,
    vacancies.location,
  ],
  sortFields: {
    createdAt: vacancies.createdAt,
    updatedAt: vacancies.updatedAt,
    title: vacancies.title,
    publishedAt: vacancies.publishedAt,
    deadlineAt: vacancies.deadlineAt,
    status: vacancies.status,
  },
  defaultSortField: "createdAt",
});

const publicVacancyQueryBuilder = createQueryBuilder<
  typeof vacancies,
  PublicVacancySortField
>({
  table: vacancies,
  searchFields: [
    vacancies.title,
    vacancies.excerpt,
    vacancies.department,
    vacancies.location,
  ],
  sortFields: {
    publishedAt: vacancies.publishedAt,
    deadlineAt: vacancies.deadlineAt,
    createdAt: vacancies.createdAt,
    title: vacancies.title,
  },
  defaultSortField: "publishedAt",
});

const vacancyApplicationQueryBuilder = createQueryBuilder<
  typeof vacancyApplications,
  VacancyApplicationSortField
>({
  table: vacancyApplications,
  searchFields: [vacancyApplications.fullName, vacancyApplications.email],
  sortFields: {
    createdAt: vacancyApplications.createdAt,
    status: vacancyApplications.status,
  },
  defaultSortField: "createdAt",
});

const buildTagMap = (
  rows: Array<{ vacancyId: number; id: number; name: string; slug: string }>,
) => {
  return rows.reduce(
    (
      acc: Record<number, Array<{ id: number; name: string; slug: string }>>,
      row,
    ) => {
      if (!acc[row.vacancyId]) acc[row.vacancyId] = [];
      acc[row.vacancyId]!.push({ id: row.id, name: row.name, slug: row.slug });
      return acc;
    },
    {},
  );
};

export const createVacancyRepository = (db: DbClient) => {
  return {
    async getTagsForVacancies(vacancyIds: number[]) {
      if (vacancyIds.length === 0) return {};

      const rows = await db
        .select({
          vacancyId: vacancyTags.vacancyId,
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(vacancyTags)
        .innerJoin(tags, eq(vacancyTags.tagId, tags.id))
        .where(inArray(vacancyTags.vacancyId, vacancyIds));

      return buildTagMap(rows);
    },

    async getApplicationCounts(vacancyIds: number[]) {
      if (vacancyIds.length === 0) return {};

      const rows = await db
        .select({
          vacancyId: vacancyApplications.vacancyId,
          count: sql<number>`count(*)`,
        })
        .from(vacancyApplications)
        .where(inArray(vacancyApplications.vacancyId, vacancyIds))
        .groupBy(vacancyApplications.vacancyId);

      return rows.reduce((acc: Record<number, number>, row) => {
        acc[row.vacancyId] = row.count ?? 0;
        return acc;
      }, {});
    },

    async findAll(query: VacancyQuery) {
      const { page, limit, search, sortBy, sortOrder, status } = query;

      const conditions = [];
      if (status) {
        conditions.push(eq(vacancies.status, status));
      }

      const searchCondition = vacancyQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = db
        .select({
          id: vacancies.id,
          title: vacancies.title,
          slug: vacancies.slug,
          excerpt: vacancies.excerpt,
          featuredImageUrl: vacancies.featuredImageUrl,
          department: vacancies.department,
          location: vacancies.location,
          workplaceType: vacancies.workplaceType,
          employmentType: vacancies.employmentType,
          seniority: vacancies.seniority,
          salaryMin: vacancies.salaryMin,
          salaryMax: vacancies.salaryMax,
          salaryCurrency: vacancies.salaryCurrency,
          externalApplyUrl: vacancies.externalApplyUrl,
          applyEmail: vacancies.applyEmail,
          status: vacancies.status,
          publishedAt: vacancies.publishedAt,
          deadlineAt: vacancies.deadlineAt,
          createdByUserId: vacancies.createdByUserId,
          createdAt: vacancies.createdAt,
          updatedAt: vacancies.updatedAt,
        })
        .from(vacancies);

      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = vacancyQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const finalQuery = vacancyQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      );

      const rows = await finalQuery;

      const vacancyIds = rows.map((row) => row.id);
      const [tagsByVacancy, countsByVacancy] = await Promise.all([
        this.getTagsForVacancies(vacancyIds),
        this.getApplicationCounts(vacancyIds),
      ]);

      const items = rows.map((row) => ({
        ...row,
        tags: mapTagList(tagsByVacancy[row.id] || []),
        applicationCount: countsByVacancy[row.id] ?? 0,
      }));

      const total = await countRecords(db, vacancies, whereClause);
      return buildListResult(items, total, page, limit);
    },

    async findById(id: number) {
      const [row] = await db
        .select({
          id: vacancies.id,
          title: vacancies.title,
          slug: vacancies.slug,
          excerpt: vacancies.excerpt,
          description: vacancies.description,
          featuredImageUrl: vacancies.featuredImageUrl,
          department: vacancies.department,
          location: vacancies.location,
          workplaceType: vacancies.workplaceType,
          employmentType: vacancies.employmentType,
          seniority: vacancies.seniority,
          salaryMin: vacancies.salaryMin,
          salaryMax: vacancies.salaryMax,
          salaryCurrency: vacancies.salaryCurrency,
          externalApplyUrl: vacancies.externalApplyUrl,
          applyEmail: vacancies.applyEmail,
          status: vacancies.status,
          publishedAt: vacancies.publishedAt,
          deadlineAt: vacancies.deadlineAt,
          createdByUserId: vacancies.createdByUserId,
          createdAt: vacancies.createdAt,
          updatedAt: vacancies.updatedAt,
        })
        .from(vacancies)
        .where(eq(vacancies.id, id))
        .limit(1);

      if (!row) return null;

      const [tagsRows, countRow] = await Promise.all([
        db
          .select({
            id: tags.id,
            name: tags.name,
            slug: tags.slug,
          })
          .from(vacancyTags)
          .innerJoin(tags, eq(vacancyTags.tagId, tags.id))
          .where(eq(vacancyTags.vacancyId, id)),
        db
          .select({ count: sql<number>`count(*)` })
          .from(vacancyApplications)
          .where(eq(vacancyApplications.vacancyId, id)),
      ]);

      return {
        ...row,
        tags: mapTagList(tagsRows),
        applicationCount: countRow[0]?.count ?? 0,
      };
    },

    async findBySlug(slug: string) {
      const [row] = await db
        .select({
          id: vacancies.id,
          title: vacancies.title,
          slug: vacancies.slug,
          excerpt: vacancies.excerpt,
          description: vacancies.description,
          featuredImageUrl: vacancies.featuredImageUrl,
          department: vacancies.department,
          location: vacancies.location,
          workplaceType: vacancies.workplaceType,
          employmentType: vacancies.employmentType,
          seniority: vacancies.seniority,
          salaryMin: vacancies.salaryMin,
          salaryMax: vacancies.salaryMax,
          salaryCurrency: vacancies.salaryCurrency,
          externalApplyUrl: vacancies.externalApplyUrl,
          applyEmail: vacancies.applyEmail,
          status: vacancies.status,
          publishedAt: vacancies.publishedAt,
          deadlineAt: vacancies.deadlineAt,
          createdByUserId: vacancies.createdByUserId,
          createdAt: vacancies.createdAt,
          updatedAt: vacancies.updatedAt,
        })
        .from(vacancies)
        .where(eq(vacancies.slug, slug))
        .limit(1);

      if (!row) return null;

      const tagsRows = await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(vacancyTags)
        .innerJoin(tags, eq(vacancyTags.tagId, tags.id))
        .where(eq(vacancyTags.vacancyId, row.id));

      const counts = await this.getApplicationCounts([row.id]);

      return {
        ...row,
        tags: mapTagList(tagsRows),
        applicationCount: counts[row.id] ?? 0,
      };
    },

    async create(data: CreateVacancyRepositoryInput) {
      const { tagIds, ...rest } = data;
      const insertValues = stripUndefinedValues({
        ...rest,
        publishedAt: rest.publishedAt ?? null,
        deadlineAt: rest.deadlineAt ?? null,
      }) as typeof vacancies.$inferInsert;

      const [created] = await db
        .insert(vacancies)
        .values(insertValues)
        .returning();

      if (!created) {
        throw new Error("Failed to create vacancy");
      }

      if (tagIds && tagIds.length > 0) {
        await db
          .insert(vacancyTags)
          .values(tagIds.map((tagId) => ({ vacancyId: created.id, tagId })));
      }

      return created;
    },

    async update(id: number, data: UpdateVacancyRepositoryInput) {
      const { tagIds, ...rest } = data;
      const sanitized = stripUndefinedValues(rest);

      const [updated] = await db
        .update(vacancies)
        .set({
          ...sanitized,
          ...(Object.prototype.hasOwnProperty.call(sanitized, "publishedAt")
            ? {
                publishedAt:
                  (sanitized as { publishedAt?: string | null }).publishedAt ??
                  null,
              }
            : {}),
          ...(Object.prototype.hasOwnProperty.call(sanitized, "deadlineAt")
            ? {
                deadlineAt:
                  (sanitized as { deadlineAt?: string | null }).deadlineAt ??
                  null,
              }
            : {}),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(vacancies.id, id))
        .returning();

      if (tagIds !== undefined) {
        await db.delete(vacancyTags).where(eq(vacancyTags.vacancyId, id));
        if (tagIds.length > 0) {
          await db
            .insert(vacancyTags)
            .values(tagIds.map((tagId) => ({ vacancyId: id, tagId })));
        }
      }

      return updated;
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(vacancies)
        .where(eq(vacancies.id, id))
        .returning();
      return deleted;
    },

    async findPublic(query: PublicVacancyQuery) {
      const { page, limit, search, sortBy, sortOrder, openOnly } = query;

      const conditions = [
        isNotNull(vacancies.publishedAt),
        lte(vacancies.publishedAt, sql`CURRENT_TIMESTAMP`),
        inArray(vacancies.status, ["PUBLISHED", "CLOSED"]),
      ];

      if (openOnly) {
        conditions.push(eq(vacancies.status, "PUBLISHED"));
        const openCondition = or(
          isNull(vacancies.deadlineAt),
          gt(vacancies.deadlineAt, sql`CURRENT_TIMESTAMP`),
        );
        if (openCondition) conditions.push(openCondition);
      }

      const searchCondition = vacancyQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause = and(...conditions);

      const baseQuery = db
        .select({
          id: vacancies.id,
          title: vacancies.title,
          slug: vacancies.slug,
          excerpt: vacancies.excerpt,
          featuredImageUrl: vacancies.featuredImageUrl,
          department: vacancies.department,
          location: vacancies.location,
          workplaceType: vacancies.workplaceType,
          employmentType: vacancies.employmentType,
          seniority: vacancies.seniority,
          salaryMin: vacancies.salaryMin,
          salaryMax: vacancies.salaryMax,
          salaryCurrency: vacancies.salaryCurrency,
          externalApplyUrl: vacancies.externalApplyUrl,
          applyEmail: vacancies.applyEmail,
          status: vacancies.status,
          publishedAt: vacancies.publishedAt,
          deadlineAt: vacancies.deadlineAt,
          createdAt: vacancies.createdAt,
          updatedAt: vacancies.updatedAt,
        })
        .from(vacancies)
        .where(whereClause);

      const sortedQuery = publicVacancyQueryBuilder.applySort(
        baseQuery,
        sortBy,
        sortOrder,
      );
      const finalQuery = publicVacancyQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      );

      const rows = await finalQuery;
      const vacancyIds = rows.map((row) => row.id);
      const tagsByVacancy = await this.getTagsForVacancies(vacancyIds);

      const items = rows.map((row) => ({
        ...row,
        tags: mapTagList(tagsByVacancy[row.id] || []),
      }));

      const total = await countRecords(db, vacancies, whereClause);
      return buildListResult(items, total, page, limit);
    },

    async findPublicBySlug(slug: string) {
      const [row] = await db
        .select({
          id: vacancies.id,
          title: vacancies.title,
          slug: vacancies.slug,
          excerpt: vacancies.excerpt,
          description: vacancies.description,
          featuredImageUrl: vacancies.featuredImageUrl,
          department: vacancies.department,
          location: vacancies.location,
          workplaceType: vacancies.workplaceType,
          employmentType: vacancies.employmentType,
          seniority: vacancies.seniority,
          salaryMin: vacancies.salaryMin,
          salaryMax: vacancies.salaryMax,
          salaryCurrency: vacancies.salaryCurrency,
          externalApplyUrl: vacancies.externalApplyUrl,
          applyEmail: vacancies.applyEmail,
          status: vacancies.status,
          publishedAt: vacancies.publishedAt,
          deadlineAt: vacancies.deadlineAt,
          createdAt: vacancies.createdAt,
          updatedAt: vacancies.updatedAt,
        })
        .from(vacancies)
        .where(
          and(
            eq(vacancies.slug, slug),
            isNotNull(vacancies.publishedAt),
            lte(vacancies.publishedAt, sql`CURRENT_TIMESTAMP`),
            inArray(vacancies.status, ["PUBLISHED", "CLOSED"]),
          ),
        )
        .limit(1);

      if (!row) return null;

      const [tagsRows, counts] = await Promise.all([
        db
          .select({ id: tags.id, name: tags.name, slug: tags.slug })
          .from(vacancyTags)
          .innerJoin(tags, eq(vacancyTags.tagId, tags.id))
          .where(eq(vacancyTags.vacancyId, row.id)),
        this.getApplicationCounts([row.id]),
      ]);

      return {
        ...row,
        tags: mapTagList(tagsRows),
        applicationCount: counts[row.id] ?? 0,
      };
    },

    async findPublicById(id: number) {
      const [row] = await db
        .select({
          id: vacancies.id,
          title: vacancies.title,
          slug: vacancies.slug,
          excerpt: vacancies.excerpt,
          description: vacancies.description,
          featuredImageUrl: vacancies.featuredImageUrl,
          department: vacancies.department,
          location: vacancies.location,
          workplaceType: vacancies.workplaceType,
          employmentType: vacancies.employmentType,
          seniority: vacancies.seniority,
          salaryMin: vacancies.salaryMin,
          salaryMax: vacancies.salaryMax,
          salaryCurrency: vacancies.salaryCurrency,
          externalApplyUrl: vacancies.externalApplyUrl,
          applyEmail: vacancies.applyEmail,
          status: vacancies.status,
          publishedAt: vacancies.publishedAt,
          deadlineAt: vacancies.deadlineAt,
          createdAt: vacancies.createdAt,
          updatedAt: vacancies.updatedAt,
        })
        .from(vacancies)
        .where(
          and(
            eq(vacancies.id, id),
            isNotNull(vacancies.publishedAt),
            lte(vacancies.publishedAt, sql`CURRENT_TIMESTAMP`),
            inArray(vacancies.status, ["PUBLISHED", "CLOSED"]),
          ),
        )
        .limit(1);

      if (!row) return null;

      const [tagsRows, counts] = await Promise.all([
        db
          .select({ id: tags.id, name: tags.name, slug: tags.slug })
          .from(vacancyTags)
          .innerJoin(tags, eq(vacancyTags.tagId, tags.id))
          .where(eq(vacancyTags.vacancyId, row.id)),
        this.getApplicationCounts([row.id]),
      ]);

      return {
        ...row,
        tags: mapTagList(tagsRows),
        applicationCount: counts[row.id] ?? 0,
      };
    },

    async createApplication(
      vacancyId: number,
      data: CreateVacancyApplicationInput,
    ) {
      const [created] = await db
        .insert(vacancyApplications)
        .values({
          vacancyId,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          resumeUrl: data.resumeUrl,
          portfolioUrl: data.portfolioUrl,
          linkedinUrl: data.linkedinUrl,
          coverLetter: data.coverLetter,
          status: "SUBMITTED",
        })
        .returning();

      if (!created) {
        throw new Error("Failed to create application");
      }

      return created;
    },

    async findApplicationsByVacancyId(
      vacancyId: number,
      query: VacancyApplicationQuery,
    ) {
      const { page, limit, search, sortBy, sortOrder, status } = query;

      const conditions = [eq(vacancyApplications.vacancyId, vacancyId)];
      if (status) {
        conditions.push(eq(vacancyApplications.status, status));
      }

      if (search && search.trim().length > 0) {
        const normalized = search.trim();
        const searchCondition = or(
          ilike(vacancyApplications.fullName, `%${normalized}%`),
          ilike(vacancyApplications.email, `%${normalized}%`),
        );
        if (searchCondition) conditions.push(searchCondition);
      }

      const whereClause = and(...conditions);

      const baseQuery = db
        .select({
          id: vacancyApplications.id,
          vacancyId: vacancyApplications.vacancyId,
          fullName: vacancyApplications.fullName,
          email: vacancyApplications.email,
          phone: vacancyApplications.phone,
          resumeUrl: vacancyApplications.resumeUrl,
          portfolioUrl: vacancyApplications.portfolioUrl,
          linkedinUrl: vacancyApplications.linkedinUrl,
          coverLetter: vacancyApplications.coverLetter,
          status: vacancyApplications.status,
          createdAt: vacancyApplications.createdAt,
          reviewedAt: vacancyApplications.reviewedAt,
          notes: vacancyApplications.notes,
        })
        .from(vacancyApplications)
        .where(whereClause);

      const sorted = vacancyApplicationQueryBuilder.applySort(
        baseQuery,
        sortBy,
        sortOrder,
      );
      const finalQuery = vacancyApplicationQueryBuilder.applyPagination(
        sorted,
        page,
        limit,
      );

      const rows = await finalQuery;
      const total = await countRecords(db, vacancyApplications, whereClause);
      return buildListResult(rows, total, page, limit);
    },

    async findApplicationById(vacancyId: number, applicationId: number) {
      const [row] = await db
        .select({
          id: vacancyApplications.id,
          vacancyId: vacancyApplications.vacancyId,
          fullName: vacancyApplications.fullName,
          email: vacancyApplications.email,
          phone: vacancyApplications.phone,
          resumeUrl: vacancyApplications.resumeUrl,
          portfolioUrl: vacancyApplications.portfolioUrl,
          linkedinUrl: vacancyApplications.linkedinUrl,
          coverLetter: vacancyApplications.coverLetter,
          status: vacancyApplications.status,
          createdAt: vacancyApplications.createdAt,
          reviewedAt: vacancyApplications.reviewedAt,
          notes: vacancyApplications.notes,
        })
        .from(vacancyApplications)
        .where(
          and(
            eq(vacancyApplications.vacancyId, vacancyId),
            eq(vacancyApplications.id, applicationId),
          ),
        )
        .limit(1);

      return row ?? null;
    },

    async updateApplication(
      vacancyId: number,
      applicationId: number,
      data: UpdateVacancyApplicationInput & { reviewedAt?: string | null },
    ) {
      const sanitized = stripUndefinedValues(data);

      const [updated] = await db
        .update(vacancyApplications)
        .set({
          ...sanitized,
          ...(Object.prototype.hasOwnProperty.call(sanitized, "reviewedAt")
            ? {
                reviewedAt:
                  (sanitized as { reviewedAt?: string | null }).reviewedAt ??
                  null,
              }
            : {}),
        })
        .where(
          and(
            eq(vacancyApplications.vacancyId, vacancyId),
            eq(vacancyApplications.id, applicationId),
          ),
        )
        .returning();

      return updated;
    },

    async deleteApplication(vacancyId: number, applicationId: number) {
      const [deleted] = await db
        .delete(vacancyApplications)
        .where(
          and(
            eq(vacancyApplications.vacancyId, vacancyId),
            eq(vacancyApplications.id, applicationId),
          ),
        )
        .returning();

      return deleted;
    },
  };
};

export type VacancyRepository = ReturnType<typeof createVacancyRepository>;
