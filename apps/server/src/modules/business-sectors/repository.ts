import {
  and,
  asc,
  eq,
  inArray,
  isNotNull,
  lte,
} from "@suba-company-template/db/orm";
import {
  businessSectorGalleryImages,
  businessSectors,
  businessSectorServices,
  businessSectorStats,
} from "@suba-company-template/db/schema";

import type {
  BusinessSectorGalleryImageInput,
  BusinessSectorQuery,
  BusinessSectorServiceInput,
  BusinessSectorSortField,
  BusinessSectorStatInput,
  CreateBusinessSectorInput,
  PublicBusinessSectorQuery,
  UpdateBusinessSectorInput,
} from "./validators";
import type { DbClient } from "../../shared/db";
import {
  buildListResult,
  combineWhere,
  countRecords,
  createQueryBuilder,
} from "../../shared/query";
import { stripUndefinedValues } from "../../shared/utils/object";
import { ensureUniqueSlug, generateSlug } from "../../shared/utils/slug";

const businessSectorQueryBuilder = createQueryBuilder<
  typeof businessSectors,
  BusinessSectorSortField
>({
  table: businessSectors,
  searchFields: [
    businessSectors.title,
    businessSectors.excerpt,
    businessSectors.history,
  ],
  sortFields: {
    createdAt: businessSectors.createdAt,
    title: businessSectors.title,
    updatedAt: businessSectors.updatedAt,
    publishDate: businessSectors.publishDate,
  },
  defaultSortField: "createdAt",
});

const groupBySectorId = <T extends { sectorId: number }>(rows: T[]) => {
  return rows.reduce((acc: Record<number, T[]>, row) => {
    if (!acc[row.sectorId]) acc[row.sectorId] = [];
    acc[row.sectorId]!.push(row);
    return acc;
  }, {});
};

const hydrateSectors = async (
  db: DbClient,
  sectors: Array<typeof businessSectors.$inferSelect>,
) => {
  const sectorIds = sectors.map((sector) => sector.id);
  if (sectorIds.length === 0) return [];

  const [statsRows, servicesRows, galleryRows] = await Promise.all([
    db
      .select()
      .from(businessSectorStats)
      .where(inArray(businessSectorStats.sectorId, sectorIds))
      .orderBy(
        asc(businessSectorStats.sectorId),
        asc(businessSectorStats.position),
      ),
    db
      .select()
      .from(businessSectorServices)
      .where(inArray(businessSectorServices.sectorId, sectorIds))
      .orderBy(
        asc(businessSectorServices.sectorId),
        asc(businessSectorServices.position),
      ),
    db
      .select()
      .from(businessSectorGalleryImages)
      .where(inArray(businessSectorGalleryImages.sectorId, sectorIds))
      .orderBy(
        asc(businessSectorGalleryImages.sectorId),
        asc(businessSectorGalleryImages.position),
      ),
  ]);

  const statsBySector = groupBySectorId(statsRows);
  const servicesBySector = groupBySectorId(servicesRows);
  const galleryBySector = groupBySectorId(galleryRows);

  return sectors.map((sector) => ({
    ...sector,
    stats: (statsBySector[sector.id] ?? []).map((stat) => ({
      id: stat.id,
      statKey: stat.statKey,
      statValue: stat.statValue,
      position: stat.position,
    })),
    services: (servicesBySector[sector.id] ?? []).map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description,
      imageUrl: service.imageUrl,
      position: service.position,
    })),
    gallery: (galleryBySector[sector.id] ?? []).map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      position: image.position,
    })),
  }));
};

const normalizeStatRows = (
  stats: BusinessSectorStatInput[],
  sectorId: number,
) =>
  stats.map((stat, index) => ({
    sectorId,
    statKey: stat.statKey,
    statValue: stat.statValue,
    position: stat.position ?? index,
  }));

const normalizeServiceRows = (
  services: BusinessSectorServiceInput[],
  sectorId: number,
) =>
  services.map((service, index) => ({
    sectorId,
    title: service.title,
    description: service.description,
    imageUrl: service.imageUrl,
    position: service.position ?? index,
  }));

const normalizeGalleryRows = (
  gallery: BusinessSectorGalleryImageInput[],
  sectorId: number,
) =>
  gallery.map((image, index) => ({
    sectorId,
    imageUrl: image.imageUrl,
    position: image.position ?? index,
  }));

export const createBusinessSectorRepository = (db: DbClient) => {
  type RepositoryUpdateInput = Omit<
    UpdateBusinessSectorInput,
    "stats" | "services" | "gallery"
  > & {
    slug?: string;
    stats?: BusinessSectorStatInput[];
    services?: BusinessSectorServiceInput[];
    gallery?: BusinessSectorGalleryImageInput[];
  };

  return {
    async findAll(query: BusinessSectorQuery) {
      const { page, limit, search, sortBy, sortOrder } = query;

      const whereClause = businessSectorQueryBuilder.applySearch(search);

      const baseQuery = db.select().from(businessSectors);
      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = businessSectorQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const finalQuery = businessSectorQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      );

      const sectors = await finalQuery;
      const items = await hydrateSectors(db, sectors);
      const total = await countRecords(db, businessSectors, whereClause);

      return buildListResult(items, total, page, limit);
    },

    async findPublished(query: PublicBusinessSectorQuery) {
      const { page, limit, search, sortBy, sortOrder } = query;
      const nowIso = new Date().toISOString();

      const whereClause = combineWhere(
        businessSectorQueryBuilder.applySearch(search),
        isNotNull(businessSectors.publishDate),
        lte(businessSectors.publishDate, nowIso),
      );

      const baseQuery = db.select().from(businessSectors);
      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = businessSectorQueryBuilder.applySort(
        queryWithWhere,
        sortBy as BusinessSectorSortField | undefined,
        sortOrder,
      );

      const finalQuery = businessSectorQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      );

      const sectors = await finalQuery;
      const items = await hydrateSectors(db, sectors);
      const total = await countRecords(db, businessSectors, whereClause);

      return buildListResult(items, total, page, limit);
    },

    async findById(id: number) {
      const [sector] = await db
        .select()
        .from(businessSectors)
        .where(eq(businessSectors.id, id))
        .limit(1);

      if (!sector) return null;
      const [hydrated] = await hydrateSectors(db, [sector]);
      return hydrated ?? null;
    },

    async findBySlug(slug: string) {
      const [sector] = await db
        .select()
        .from(businessSectors)
        .where(eq(businessSectors.slug, slug))
        .limit(1);

      if (!sector) return null;
      const [hydrated] = await hydrateSectors(db, [sector]);
      return hydrated ?? null;
    },

    async findPublishedById(id: number) {
      const nowIso = new Date().toISOString();
      const [sector] = await db
        .select()
        .from(businessSectors)
        .where(
          and(
            eq(businessSectors.id, id),
            isNotNull(businessSectors.publishDate),
            lte(businessSectors.publishDate, nowIso),
          ),
        )
        .limit(1);

      if (!sector) return null;
      const [hydrated] = await hydrateSectors(db, [sector]);
      return hydrated ?? null;
    },

    async findPublishedBySlug(slug: string) {
      const nowIso = new Date().toISOString();
      const [sector] = await db
        .select()
        .from(businessSectors)
        .where(
          and(
            eq(businessSectors.slug, slug),
            isNotNull(businessSectors.publishDate),
            lte(businessSectors.publishDate, nowIso),
          ),
        )
        .limit(1);

      if (!sector) return null;
      const [hydrated] = await hydrateSectors(db, [sector]);
      return hydrated ?? null;
    },

    async create(data: CreateBusinessSectorInput) {
      const { stats, services, gallery, ...sectorData } = data;

      const baseSlug = sectorData.slug ?? generateSlug(sectorData.title);
      const slug = await ensureUniqueSlug(baseSlug, async (candidate) => {
        const existing = await this.findBySlug(candidate);
        return !!existing;
      });

      const [created] = await db
        .insert(businessSectors)
        .values({ ...sectorData, slug })
        .returning();

      if (!created) {
        throw new Error("Failed to create business sector");
      }

      const ops: Promise<unknown>[] = [];

      if (stats && stats.length > 0) {
        ops.push(
          db
            .insert(businessSectorStats)
            .values(normalizeStatRows(stats, created.id)),
        );
      }
      if (services && services.length > 0) {
        ops.push(
          db
            .insert(businessSectorServices)
            .values(normalizeServiceRows(services, created.id)),
        );
      }
      if (gallery && gallery.length > 0) {
        ops.push(
          db
            .insert(businessSectorGalleryImages)
            .values(normalizeGalleryRows(gallery, created.id)),
        );
      }

      if (ops.length > 0) {
        await Promise.all(ops);
      }

      return this.findById(created.id);
    },

    async update(id: number, data: RepositoryUpdateInput) {
      const { stats, services, gallery, ...sectorData } = data;
      const sanitizedData = stripUndefinedValues(sectorData);

      if (Object.keys(sanitizedData).length > 0) {
        await db
          .update(businessSectors)
          .set({
            ...sanitizedData,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(businessSectors.id, id));
      }

      if (stats !== undefined) {
        await db
          .delete(businessSectorStats)
          .where(eq(businessSectorStats.sectorId, id));
        if (Array.isArray(stats) && stats.length > 0) {
          await db
            .insert(businessSectorStats)
            .values(normalizeStatRows(stats, id));
        }
      }

      if (services !== undefined) {
        await db
          .delete(businessSectorServices)
          .where(eq(businessSectorServices.sectorId, id));
        if (Array.isArray(services) && services.length > 0) {
          await db
            .insert(businessSectorServices)
            .values(normalizeServiceRows(services, id));
        }
      }

      if (gallery !== undefined) {
        await db
          .delete(businessSectorGalleryImages)
          .where(eq(businessSectorGalleryImages.sectorId, id));
        if (Array.isArray(gallery) && gallery.length > 0) {
          await db
            .insert(businessSectorGalleryImages)
            .values(normalizeGalleryRows(gallery, id));
        }
      }

      return this.findById(id);
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(businessSectors)
        .where(eq(businessSectors.id, id))
        .returning();

      return deleted;
    },
  };
};

export type BusinessSectorRepository = ReturnType<
  typeof createBusinessSectorRepository
>;
