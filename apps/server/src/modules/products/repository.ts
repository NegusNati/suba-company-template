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
  products,
  productImages,
  productTags,
} from "@suba-company-template/db/schema";

import type {
  CreateProductInput,
  UpdateProductInput,
  ProductQuery,
  PublicProductQuery,
  ProductImageInput,
  ProductSortField,
} from "./validators";
import type { DbClient } from "../../shared/db";
import { getQueryAPI } from "../../shared/db/relations";
import { mapImageList, mapTagList } from "../../shared/mappers";
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

const productQueryBuilder = createQueryBuilder<
  typeof products,
  ProductSortField
>({
  table: products,
  searchFields: [products.title, products.description, products.overview],
  sortFields: {
    createdAt: products.createdAt,
    title: products.title,
    updatedAt: products.updatedAt,
  },
  defaultSortField: "createdAt",
});

export const createProductRepository = (db: DbClient) => {
  return {
    async findAll(query: ProductQuery) {
      const { page, limit, search, sortBy, sortOrder, tagId } = query;

      const conditions = [];

      const searchCondition = productQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      // Handle tag filtering
      let productIds: number[] | undefined;
      if (tagId) {
        const taggedProducts = await db
          .select({ productId: productTags.productId })
          .from(productTags)
          .where(eq(productTags.tagId, tagId));

        productIds = taggedProducts.map((p) => p.productId);
        if (productIds.length === 0) {
          return buildListResult([], 0, page, limit);
        }
        conditions.push(inArray(products.id, productIds));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get paginated product IDs
      const baseQuery = db.select({ id: products.id }).from(products);
      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = productQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const paginatedIds = (await productQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      )) as Array<{ id: number }>;

      const productIdList = paginatedIds.map((row) => row.id);

      // Load hydrated products with relations
      const items =
        productIdList.length > 0
          ? await getQueryAPI(db).products.findMany({
              where: inArray(products.id, productIdList),
              with: {
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

      // Map items to include tags
      const mappedItems = items.map((p: any) => ({
        ...p,
        images: mapImageList(p.images),
        tags: mapTagList(
          p.tags.map((pt: any) => ({
            id: pt.tag.id,
            name: pt.tag.name,
            slug: pt.tag.slug,
          })),
        ),
      }));

      const total = await countRecords(db, products, whereClause);

      return buildListResult(mappedItems, total, page, limit);
    },

    async findById(id: number) {
      return this.findWithRelations(id);
    },

    async findBySlug(slug: string) {
      const result = await getQueryAPI(db).products.findFirst({
        where: eq(products.slug, slug),
        with: {
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
        images: mapImageList(result.images),
        tags: mapTagList(
          result.tags.map((pt: any) => ({
            id: pt.tag.id,
            name: pt.tag.name,
            slug: pt.tag.slug,
          })),
        ),
      };
    },

    async findWithRelations(id: number) {
      const result = await getQueryAPI(db).products.findFirst({
        where: eq(products.id, id),
        with: {
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
        images: mapImageList(result.images),
        tags: mapTagList(
          result.tags.map((pt: any) => ({
            id: pt.tag.id,
            name: pt.tag.name,
            slug: pt.tag.slug,
          })),
        ),
      };
    },

    async findBySlugWithRelations(slug: string) {
      const product = await this.findBySlug(slug);
      if (!product) return null;

      return this.findWithRelations(product.id);
    },

    async create(data: CreateProductInput) {
      const { tagIds, images: imageInputs, ...productData } = data;

      // Auto-generate slug if not provided
      const slug =
        productData.slug ||
        (await ensureUniqueSlug(generateSlug(productData.title), async (s) => {
          const existing = await this.findBySlug(s);
          return !!existing;
        }));

      const [newProduct] = await db
        .insert(products)
        .values({ ...productData, slug })
        .returning();

      if (!newProduct) {
        throw new Error("Failed to create product");
      }

      if (imageInputs && imageInputs.length > 0) {
        await db.insert(productImages).values(
          imageInputs.map((img) => ({
            productId: newProduct.id,
            imageUrl: img.imageUrl,
            position: img.position,
          })),
        );
      }

      if (tagIds && tagIds.length > 0) {
        await db.insert(productTags).values(
          tagIds.map((tagId) => ({
            productId: newProduct.id,
            tagId,
          })),
        );
      }

      return newProduct;
    },

    async update(
      id: number,
      data: UpdateProductInput & {
        slug?: string;
        tagIds?: number[];
        images?: ProductImageInput[];
      },
    ) {
      const { tagIds, images: imageInputs, ...productData } = data;
      const sanitizedData = stripUndefinedValues(productData);

      const [updated] = await db
        .update(products)
        .set({
          ...sanitizedData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(products.id, id))
        .returning();

      if (imageInputs !== undefined) {
        await db.delete(productImages).where(eq(productImages.productId, id));
        if (imageInputs.length > 0) {
          await db.insert(productImages).values(
            imageInputs.map((img) => ({
              productId: id,
              imageUrl: img.imageUrl,
              position: img.position,
            })),
          );
        }
      }

      if (tagIds !== undefined) {
        await db.delete(productTags).where(eq(productTags.productId, id));
        if (tagIds.length > 0) {
          await db.insert(productTags).values(
            tagIds.map((tagId) => ({
              productId: id,
              tagId,
            })),
          );
        }
      }

      return updated;
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(products)
        .where(eq(products.id, id))
        .returning();
      return deleted;
    },

    async findPublicList(query: PublicProductQuery) {
      const { page, limit, search, sortBy, sortOrder, tagId, cursor } = query;

      const conditions = [];

      const searchCondition = productQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      // Handle tag filtering
      if (tagId) {
        const taggedProducts = await db
          .select({ productId: productTags.productId })
          .from(productTags)
          .where(eq(productTags.tagId, tagId));

        const productIds = taggedProducts.map((p) => p.productId);
        if (productIds.length === 0) {
          return buildListResult([], 0, page, limit);
        }
        conditions.push(inArray(products.id, productIds));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const baseQuery = db
        .select({
          id: products.id,
          title: products.title,
          slug: products.slug,
          description: products.description,
          createdAt: products.createdAt,
        })
        .from(products);

      const applyFilters = (extraCondition?: SQL) => {
        const combined = combineWhere(whereClause, extraCondition);
        return combined ? baseQuery.where(combined) : baseQuery;
      };

      const cursorValue = decodeCursorValue<string>(cursor);
      let items;
      if (cursorValue) {
        items = await applyFilters(lte(products.createdAt, cursorValue))
          .orderBy(desc(products.createdAt))
          .limit(limit);
      } else {
        const baseFiltered = applyFilters();
        const orderFn = sortOrder === "asc" ? asc : desc;
        const sortField =
          sortBy === "title" ? products.title : products.createdAt;
        const sortedQuery = baseFiltered.orderBy(orderFn(sortField));
        const offset = (page - 1) * limit;
        items = await sortedQuery.limit(limit).offset(offset);
      }

      // Get featured image for each product
      const itemsWithImages = await Promise.all(
        items.map(async (item) => {
          const [firstImage] = await db
            .select({ imageUrl: productImages.imageUrl })
            .from(productImages)
            .where(eq(productImages.productId, item.id))
            .orderBy(asc(productImages.position))
            .limit(1);

          return {
            id: item.id,
            title: item.title,
            slug: item.slug,
            description: item.description,
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

      const total = await countRecords(db, products, whereClause);

      return buildListResult(itemsWithImages, total, page, limit);
    },
  };
};

export type ProductRepository = ReturnType<typeof createProductRepository>;
