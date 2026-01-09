/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  and,
  eq,
  asc,
  inArray,
  lte,
  desc,
  type SQL,
} from "@suba-company-template/db/orm";
import {
  services,
  serviceImages,
  serviceTags,
} from "@suba-company-template/db/schema";

import type {
  CreateServiceInput,
  UpdateServiceInput,
  ServiceQuery,
  PublicServiceQuery,
  ServiceImageInput,
  ServiceSortField,
} from "./validators";
import type { DbClient } from "../../shared/db";
import { getQueryAPI } from "../../shared/db/relations";
import { mapImageList } from "../../shared/mappers";
import {
  createQueryBuilder,
  countRecords,
  buildListResult,
  decodeCursorValue,
  buildCursorResult,
  combineWhere,
} from "../../shared/query";
import { stripUndefinedValues } from "../../shared/utils/object";
import { generateSlug, ensureUniqueSlug } from "../../shared/utils/slug";

const serviceQueryBuilder = createQueryBuilder<
  typeof services,
  ServiceSortField
>({
  table: services,
  searchFields: [services.title, services.excerpt, services.description],
  sortFields: {
    createdAt: services.createdAt,
    title: services.title,
    updatedAt: services.updatedAt,
  },
  defaultSortField: "createdAt",
});

export const createServiceRepository = (db: DbClient) => {
  return {
    async findAll(query: ServiceQuery) {
      const { page, limit, search, sortBy, sortOrder } = query;

      const conditions = [];

      const searchCondition = serviceQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get paginated service IDs
      const baseQuery = db.select({ id: services.id }).from(services);
      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = serviceQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const paginatedIds = (await serviceQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      )) as Array<{ id: number }>;

      // Load hydrated services with images
      const serviceIds = paginatedIds.map((srv) => srv.id);

      const fetchedItems =
        serviceIds.length > 0
          ? await getQueryAPI(db).services.findMany({
              where: inArray(services.id, serviceIds),
              with: {
                images: {
                  orderBy: (img: any) => asc(img.position),
                },
              },
            })
          : [];

      const fetchedMap = new Map<number, any>(
        fetchedItems.map((item: any) => [item.id, item]),
      );

      const orderedItems = serviceIds
        .map((id) => fetchedMap.get(id))
        .filter((item): item is Record<string, unknown> => Boolean(item));

      const mappedItems = orderedItems.map((s: any) => ({
        ...s,
        images: mapImageList(s.images),
      }));

      const total = await countRecords(db, services, whereClause);

      return buildListResult(mappedItems, total, page, limit);
    },

    async findById(id: number) {
      return this.findWithImages(id);
    },

    async findBySlug(slug: string) {
      const result = await getQueryAPI(db).services.findFirst({
        where: eq(services.slug, slug),
        with: {
          images: {
            orderBy: (img: any) => asc(img.position),
          },
        },
      });

      if (!result) return null;

      return {
        ...result,
        images: mapImageList(result.images),
      };
    },

    async findWithImages(id: number) {
      const result = await getQueryAPI(db).services.findFirst({
        where: eq(services.id, id),
        with: {
          images: {
            orderBy: (img: any) => asc(img.position),
          },
        },
      });

      if (!result) return null;

      return {
        ...result,
        images: mapImageList(result.images),
      };
    },

    async create(data: CreateServiceInput) {
      const { images: imageInputs, ...serviceData } = data;

      const slug =
        serviceData.slug ||
        (await ensureUniqueSlug(generateSlug(serviceData.title), async (s) => {
          const existing = await this.findBySlug(s);
          return !!existing;
        }));

      const [newService] = await db
        .insert(services)
        .values({ ...serviceData, slug })
        .returning();

      if (!newService) {
        throw new Error("Failed to create service");
      }

      if (imageInputs && imageInputs.length > 0) {
        await db.insert(serviceImages).values(
          imageInputs.map((img) => ({
            serviceId: newService.id,
            imageUrl: img.imageUrl,
            position: img.position,
          })),
        );
      }

      return newService;
    },

    async update(
      id: number,
      data: UpdateServiceInput & {
        slug?: string;
        images?: ServiceImageInput[];
      },
    ) {
      const { images: imageInputs, ...serviceData } = data;
      const sanitizedData = stripUndefinedValues(serviceData);

      const [updated] = await db
        .update(services)
        .set({
          ...sanitizedData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(services.id, id))
        .returning();

      if (imageInputs !== undefined) {
        await db.delete(serviceImages).where(eq(serviceImages.serviceId, id));
        if (imageInputs.length > 0) {
          await db.insert(serviceImages).values(
            imageInputs.map((img) => ({
              serviceId: id,
              imageUrl: img.imageUrl,
              position: img.position,
            })),
          );
        }
      }

      return updated;
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(services)
        .where(eq(services.id, id))
        .returning();
      return deleted;
    },

    async findPublicList(query: PublicServiceQuery) {
      const { page, limit, search, sortBy, sortOrder, tagId, cursor } = query;

      const conditions = [];

      const searchCondition = serviceQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      // Handle tag filtering
      if (tagId) {
        const taggedServices = await db
          .select({ serviceId: serviceTags.serviceId })
          .from(serviceTags)
          .where(eq(serviceTags.tagId, tagId));

        const serviceIds = taggedServices.map((s) => s.serviceId);
        if (serviceIds.length === 0) {
          return buildListResult([], 0, page, limit);
        }
        conditions.push(inArray(services.id, serviceIds));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = db
        .select({
          id: services.id,
          title: services.title,
          slug: services.slug,
          excerpt: services.excerpt,
          createdAt: services.createdAt,
        })
        .from(services);

      const applyFilters = (extraCondition?: SQL) => {
        const combined = combineWhere(whereClause, extraCondition);
        return combined ? baseQuery.where(combined) : baseQuery;
      };

      // If cursor is provided, switch to cursor pagination on createdAt desc
      const cursorValue = decodeCursorValue<string>(cursor);
      let paginatedQuery;
      if (cursorValue) {
        paginatedQuery = applyFilters(lte(services.createdAt, cursorValue))
          .orderBy(desc(services.createdAt))
          .limit(limit);
      } else {
        const filteredQuery = applyFilters();
        const sortedQuery = serviceQueryBuilder.applySort(
          filteredQuery,
          sortBy,
          sortOrder,
        );
        paginatedQuery = serviceQueryBuilder.applyPagination(
          sortedQuery,
          page,
          limit,
        );
      }

      const items = await paginatedQuery;

      const itemsWithImages = await Promise.all(
        items.map(
          async (item: {
            id: number;
            title: string;
            slug: string;
            excerpt: string | null;
            createdAt: string;
          }) => {
            const [firstImage] = await db
              .select({ imageUrl: serviceImages.imageUrl })
              .from(serviceImages)
              .where(eq(serviceImages.serviceId, item.id))
              .orderBy(asc(serviceImages.position))
              .limit(1);

            return {
              id: item.id,
              title: item.title,
              slug: item.slug,
              excerpt: item.excerpt,
              createdAt: item.createdAt,
              featuredImage: firstImage?.imageUrl ?? null,
            };
          },
        ),
      );

      if (cursorValue) {
        // Cursor mode: do not compute total; return nextCursor
        const cursorResult = buildCursorResult(
          itemsWithImages,
          limit,
          (item) => item.createdAt,
        );
        return {
          ...cursorResult,
          page,
          total: undefined,
        };
      }

      const total = await countRecords(db, services, whereClause);
      return buildListResult(itemsWithImages, total, page, limit);
    },

    async findPublicBySlug(slug: string) {
      const service = await this.findBySlug(slug);
      if (!service) return null;

      const images = await db
        .select({
          imageUrl: serviceImages.imageUrl,
          position: serviceImages.position,
        })
        .from(serviceImages)
        .where(eq(serviceImages.serviceId, service.id))
        .orderBy(asc(serviceImages.position));

      return {
        ...service,
        images,
      };
    },
  };
};

export type ServiceRepository = ReturnType<typeof createServiceRepository>;
