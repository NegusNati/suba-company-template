/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  and,
  eq,
  desc,
  asc,
  inArray,
  lte,
  type SQL,
} from "@suba-company-template/db/orm";
import {
  caseStudies,
  caseStudyImages,
  caseStudyTags,
  partners,
  services,
} from "@suba-company-template/db/schema";

import type {
  CreateCaseStudyInput,
  UpdateCaseStudyInput,
  CaseStudyQuery,
  PublicCaseStudyQuery,
  CaseStudyImageInput,
  CaseStudySortField,
} from "./validators";
import type { DbClient } from "../../shared/db";
import { getQueryAPI } from "../../shared/db/relations";
import {
  mapPartnerSummary,
  mapServiceSummary,
  mapImageList,
  mapTagList,
} from "../../shared/mappers";
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

const caseStudyQueryBuilder = createQueryBuilder<
  typeof caseStudies,
  CaseStudySortField
>({
  table: caseStudies,
  searchFields: [
    caseStudies.title,
    caseStudies.excerpt,
    caseStudies.overview,
    caseStudies.projectScope,
  ],
  sortFields: {
    createdAt: caseStudies.createdAt,
    title: caseStudies.title,
    updatedAt: caseStudies.updatedAt,
  },
  defaultSortField: "createdAt",
});

export const createCaseStudyRepository = (db: DbClient) => {
  return {
    async findAll(query: CaseStudyQuery) {
      const {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        clientId,
        serviceId,
        tagId,
      } = query;

      const conditions = [];

      if (clientId) {
        conditions.push(eq(caseStudies.clientId, clientId));
      }
      if (serviceId) {
        conditions.push(eq(caseStudies.serviceId, serviceId));
      }

      const searchCondition = caseStudyQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      // Handle tag filtering
      let caseStudyIds: number[] | undefined;
      if (tagId) {
        const taggedCaseStudies = await db
          .select({ caseStudyId: caseStudyTags.caseStudyId })
          .from(caseStudyTags)
          .where(eq(caseStudyTags.tagId, tagId));

        caseStudyIds = taggedCaseStudies.map((cs) => cs.caseStudyId);
        if (caseStudyIds.length === 0) {
          return buildListResult([], 0, page, limit);
        }
        conditions.push(inArray(caseStudies.id, caseStudyIds));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get paginated case study IDs
      const baseQuery = db.select({ id: caseStudies.id }).from(caseStudies);
      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = caseStudyQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const paginatedIds = (await caseStudyQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      )) as Array<{ id: number }>;

      const caseStudyIdList = paginatedIds.map((row) => row.id);

      // Load hydrated case studies with relations
      const items =
        caseStudyIdList.length > 0
          ? await getQueryAPI(db).caseStudies.findMany({
              where: inArray(caseStudies.id, caseStudyIdList),
              with: {
                partner: true,
                service: true,
                images: {
                  orderBy: (img: any) => asc(img.position),
                },
                tags: {
                  with: {
                    tag: true,
                  },
                },
              },
            })
          : [];

      // Map items to include client/service and tags
      const mappedItems = items.map((cs: any) => ({
        ...cs,
        client: cs.partner ? mapPartnerSummary(cs.partner) : null,
        service: cs.service ? mapServiceSummary(cs.service) : null,
        images: mapImageList(cs.images),
        tags: mapTagList(
          cs.tags.map((ct: any) => ({
            id: ct.tag.id,
            name: ct.tag.name,
            slug: ct.tag.slug,
          })),
        ),
        partner: undefined,
      }));

      const total = await countRecords(db, caseStudies, whereClause);

      return buildListResult(mappedItems, total, page, limit);
    },

    async findById(id: number) {
      return this.findWithRelations(id);
    },

    async findBySlug(slug: string) {
      const result = await getQueryAPI(db).caseStudies.findFirst({
        where: eq(caseStudies.slug, slug),
        with: {
          partner: true,
          service: true,
          images: {
            orderBy: (img: any) => asc(img.position),
          },
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });

      if (!result) return null;

      return {
        ...result,
        client: result.partner ? mapPartnerSummary(result.partner) : null,
        service: result.service ? mapServiceSummary(result.service) : null,
        images: mapImageList(result.images),
        tags: mapTagList(
          result.tags.map((ct: any) => ({
            id: ct.tag.id,
            name: ct.tag.name,
            slug: ct.tag.slug,
          })),
        ),
        partner: undefined,
      };
    },

    async findWithRelations(id: number) {
      const result = await getQueryAPI(db).caseStudies.findFirst({
        where: eq(caseStudies.id, id),
        with: {
          partner: true,
          service: true,
          images: {
            orderBy: (img: any) => asc(img.position),
          },
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });

      if (!result) return null;

      return {
        ...result,
        client: result.partner ? mapPartnerSummary(result.partner) : null,
        service: result.service ? mapServiceSummary(result.service) : null,
        images: mapImageList(result.images),
        tags: mapTagList(
          result.tags.map((ct: any) => ({
            id: ct.tag.id,
            name: ct.tag.name,
            slug: ct.tag.slug,
          })),
        ),
        partner: undefined,
      };
    },

    async findBySlugWithRelations(slug: string) {
      const caseStudy = await this.findBySlug(slug);
      if (!caseStudy) return null;

      return this.findWithRelations(caseStudy.id);
    },

    async create(data: CreateCaseStudyInput) {
      const { tagIds, images: imageInputs, ...caseStudyData } = data;

      // Auto-generate slug if not provided
      const slug =
        caseStudyData.slug ||
        (await ensureUniqueSlug(
          generateSlug(caseStudyData.title),
          async (s) => {
            const existing = await this.findBySlug(s);
            return !!existing;
          },
        ));

      const [newCaseStudy] = await db
        .insert(caseStudies)
        .values({ ...caseStudyData, slug })
        .returning();

      if (!newCaseStudy) {
        throw new Error("Failed to create case study");
      }

      if (imageInputs && imageInputs.length > 0) {
        await db.insert(caseStudyImages).values(
          imageInputs.map((img) => ({
            caseStudyId: newCaseStudy.id,
            imageUrl: img.imageUrl,
            caption: img.caption,
            position: img.position,
          })),
        );
      }

      if (tagIds && tagIds.length > 0) {
        await db.insert(caseStudyTags).values(
          tagIds.map((tagId) => ({
            caseStudyId: newCaseStudy.id,
            tagId,
          })),
        );
      }

      return newCaseStudy;
    },

    async update(
      id: number,
      data: UpdateCaseStudyInput & {
        slug?: string;
        tagIds?: number[];
        images?: CaseStudyImageInput[];
      },
    ) {
      const { tagIds, images: imageInputs, ...caseStudyData } = data;
      const sanitizedData = stripUndefinedValues(caseStudyData);

      const [updated] = await db
        .update(caseStudies)
        .set({
          ...sanitizedData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(caseStudies.id, id))
        .returning();

      if (imageInputs !== undefined) {
        await db
          .delete(caseStudyImages)
          .where(eq(caseStudyImages.caseStudyId, id));
        if (imageInputs.length > 0) {
          await db.insert(caseStudyImages).values(
            imageInputs.map((img) => ({
              caseStudyId: id,
              imageUrl: img.imageUrl,
              caption: img.caption,
              position: img.position,
            })),
          );
        }
      }

      if (tagIds !== undefined) {
        await db.delete(caseStudyTags).where(eq(caseStudyTags.caseStudyId, id));
        if (tagIds.length > 0) {
          await db.insert(caseStudyTags).values(
            tagIds.map((tagId) => ({
              caseStudyId: id,
              tagId,
            })),
          );
        }
      }

      return updated;
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(caseStudies)
        .where(eq(caseStudies.id, id))
        .returning();
      return deleted;
    },

    async findPublicList(query: PublicCaseStudyQuery) {
      const {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        clientId,
        serviceId,
        tagId,
        cursor,
      } = query;

      const conditions = [];

      if (clientId) {
        conditions.push(eq(caseStudies.clientId, clientId));
      }
      if (serviceId) {
        conditions.push(eq(caseStudies.serviceId, serviceId));
      }

      const searchCondition = caseStudyQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      // Handle tag filtering
      if (tagId) {
        const taggedCaseStudies = await db
          .select({ caseStudyId: caseStudyTags.caseStudyId })
          .from(caseStudyTags)
          .where(eq(caseStudyTags.tagId, tagId));

        const caseStudyIds = taggedCaseStudies.map((cs) => cs.caseStudyId);
        if (caseStudyIds.length === 0) {
          return buildListResult([], 0, page, limit);
        }
        conditions.push(inArray(caseStudies.id, caseStudyIds));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Build query with left joins for client and service names
      const baseQuery = db
        .select({
          id: caseStudies.id,
          title: caseStudies.title,
          slug: caseStudies.slug,
          excerpt: caseStudies.excerpt,
          clientName: partners.title,
          serviceName: services.title,
          createdAt: caseStudies.createdAt,
        })
        .from(caseStudies)
        .leftJoin(partners, eq(caseStudies.clientId, partners.id))
        .leftJoin(services, eq(caseStudies.serviceId, services.id));

      const applyFilters = (extraCondition?: SQL) => {
        const combined = combineWhere(whereClause, extraCondition);
        return combined ? baseQuery.where(combined) : baseQuery;
      };

      const cursorValue = decodeCursorValue<string>(cursor);
      let items;
      if (cursorValue) {
        items = await applyFilters(lte(caseStudies.createdAt, cursorValue))
          .orderBy(desc(caseStudies.createdAt))
          .limit(limit);
      } else {
        const baseFiltered = applyFilters();
        const orderFn = sortOrder === "asc" ? asc : desc;
        const sortField =
          sortBy === "title" ? caseStudies.title : caseStudies.createdAt;
        const sortedQuery = baseFiltered.orderBy(orderFn(sortField));
        const offset = (page - 1) * limit;
        items = await sortedQuery.limit(limit).offset(offset);
      }

      // Get featured image for each case study
      const itemsWithImages = await Promise.all(
        items.map(async (item) => {
          const [firstImage] = await db
            .select({ imageUrl: caseStudyImages.imageUrl })
            .from(caseStudyImages)
            .where(eq(caseStudyImages.caseStudyId, item.id))
            .orderBy(asc(caseStudyImages.position))
            .limit(1);

          return {
            id: item.id,
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt,
            clientName: item.clientName,
            serviceName: item.serviceName,
            createdAt: item.createdAt,
            featuredImage: firstImage?.imageUrl ?? null,
          };
        }),
      );

      if (cursorValue) {
        const cursorResult = buildCursorResult(
          itemsWithImages,
          limit,
          (item) => item.createdAt,
        );
        return { ...cursorResult, page, total: undefined };
      }

      const total = await countRecords(db, caseStudies, whereClause);

      return buildListResult(itemsWithImages, total, page, limit);
    },
  };
};

export type CaseStudyRepository = ReturnType<typeof createCaseStudyRepository>;
