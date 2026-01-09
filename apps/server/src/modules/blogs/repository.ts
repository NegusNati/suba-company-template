import {
  and,
  eq,
  isNotNull,
  lte,
  sql,
  inArray,
  desc,
} from "@suba-company-template/db/orm";
import {
  blogs,
  blogTags,
  user,
  tags,
  userProfiles,
  userSocials,
  socials,
} from "@suba-company-template/db/schema";

import type {
  CreateBlogInput,
  UpdateBlogInput,
  BlogQuery,
  BlogSortField,
} from "./validators";
import type { DbClient } from "../../shared/db";
import { mapUserToAuthor, mapTagList } from "../../shared/mappers";
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

const blogQueryBuilder = createQueryBuilder<typeof blogs, BlogSortField>({
  table: blogs,
  searchFields: [blogs.title, blogs.excerpt, blogs.content],
  sortFields: {
    publishDate: blogs.publishDate,
    createdAt: blogs.createdAt,
    title: blogs.title,
  },
  defaultSortField: "publishDate",
});

export const createBlogRepository = (db: DbClient) => {
  return {
    async getSocialsForAuthors(authorIds: string[]) {
      if (authorIds.length === 0) return {};
      const authorsSocials = await db
        .select({
          userId: userProfiles.userId,
          id: socials.id,
          handle: userSocials.handle,
          fullUrl: userSocials.fullUrl,
          title: socials.title,
          iconUrl: socials.iconUrl,
          baseUrl: socials.baseUrl,
        })
        .from(userProfiles)
        .innerJoin(userSocials, eq(userProfiles.id, userSocials.profileId))
        .innerJoin(socials, eq(userSocials.socialId, socials.id))
        .where(inArray(userProfiles.userId, authorIds));

      return authorsSocials.reduce(
        (acc: Record<string, typeof authorsSocials>, s) => {
          if (!acc[s.userId]) acc[s.userId] = [];
          acc[s.userId]?.push(s);
          return acc;
        },
        {},
      );
    },

    async findAll(query: BlogQuery) {
      const { page, limit, search, sortBy, sortOrder, authorId, published } =
        query;

      // Build filters
      const conditions = [];
      if (authorId) {
        conditions.push(eq(blogs.authorId, authorId));
      }
      if (published === "true") {
        conditions.push(isNotNull(blogs.publishDate));
      }

      const searchCondition = blogQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Build base query with author join
      const baseQuery = db
        .select({
          id: blogs.id,
          title: blogs.title,
          slug: blogs.slug,
          excerpt: blogs.excerpt,
          content: blogs.content,
          featuredImageUrl: blogs.featuredImageUrl,
          authorId: blogs.authorId,
          publishDate: blogs.publishDate,
          readTimeMinutes: blogs.readTimeMinutes,
          createdAt: blogs.createdAt,
          updatedAt: blogs.updatedAt,
          author: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        })
        .from(blogs)
        .leftJoin(user, eq(blogs.authorId, user.id));

      const queryWithWhere = whereClause
        ? baseQuery.where(whereClause)
        : baseQuery;

      const sortedQuery = blogQueryBuilder.applySort(
        queryWithWhere,
        sortBy,
        sortOrder,
      );
      const finalQuery = blogQueryBuilder.applyPagination(
        sortedQuery,
        page,
        limit,
      );

      const blogsWithAuthors = await finalQuery;

      // Load tags for all blogs
      const blogIds = blogsWithAuthors.map((b: { id: number }) => b.id);
      const blogTagsList =
        blogIds.length > 0
          ? await db
              .select({
                blogId: blogTags.blogId,
                tagId: tags.id,
                tagName: tags.name,
                tagSlug: tags.slug,
              })
              .from(blogTags)
              .innerJoin(tags, eq(blogTags.tagId, tags.id))
              .where(inArray(blogTags.blogId, blogIds))
          : [];

      // Group tags by blog
      const tagsByBlog = blogTagsList.reduce(
        (
          acc: Record<
            number,
            Array<{ id: number; name: string; slug: string }>
          >,
          bt: {
            blogId: number;
            tagId: number;
            tagName: string;
            tagSlug: string;
          },
        ) => {
          if (!acc[bt.blogId]) acc[bt.blogId] = [];
          acc[bt.blogId]!.push({
            id: bt.tagId,
            name: bt.tagName,
            slug: bt.tagSlug,
          });
          return acc;
        },
        {},
      );

      // Load socials for authors
      const authorIds = [
        ...new Set(
          blogsWithAuthors
            .map((b: { authorId: string }) => b.authorId)
            .filter(Boolean),
        ),
      ] as string[];

      const socialsByAuthor = await this.getSocialsForAuthors(authorIds);

      // Map items to include author (with socials) and tags
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedItems = blogsWithAuthors.map((blog: any) => ({
        ...blog,
        author: blog.author
          ? mapUserToAuthor({
              ...blog.author,
              socials: socialsByAuthor[blog.author.id] || [],
            })
          : null,
        tags: mapTagList(tagsByBlog[blog.id] || []),
      }));

      const total = await countRecords(db, blogs, whereClause);

      return buildListResult(mappedItems, total, page, limit);
    },

    async findById(id: number) {
      const [blog] = await db
        .select({
          id: blogs.id,
          title: blogs.title,
          slug: blogs.slug,
          excerpt: blogs.excerpt,
          content: blogs.content,
          featuredImageUrl: blogs.featuredImageUrl,
          authorId: blogs.authorId,
          publishDate: blogs.publishDate,
          readTimeMinutes: blogs.readTimeMinutes,
          createdAt: blogs.createdAt,
          updatedAt: blogs.updatedAt,
          author: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        })
        .from(blogs)
        .leftJoin(user, eq(blogs.authorId, user.id))
        .where(eq(blogs.id, id))
        .limit(1);

      if (!blog) return null;

      // Load tags
      const blogTagsList = await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(blogTags)
        .innerJoin(tags, eq(blogTags.tagId, tags.id))
        .where(eq(blogTags.blogId, id));

      // Load socials
      const socialsMap = await this.getSocialsForAuthors([blog.authorId]);

      return {
        ...blog,
        author: blog.author
          ? mapUserToAuthor({
              ...blog.author,
              socials: socialsMap[blog.author.id] || [],
            })
          : null,
        tags: mapTagList(blogTagsList),
      };
    },

    async findBySlug(slug: string) {
      const [blog] = await db
        .select({
          id: blogs.id,
          title: blogs.title,
          slug: blogs.slug,
          excerpt: blogs.excerpt,
          content: blogs.content,
          featuredImageUrl: blogs.featuredImageUrl,
          authorId: blogs.authorId,
          publishDate: blogs.publishDate,
          readTimeMinutes: blogs.readTimeMinutes,
          createdAt: blogs.createdAt,
          updatedAt: blogs.updatedAt,
          author: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        })
        .from(blogs)
        .leftJoin(user, eq(blogs.authorId, user.id))
        .where(eq(blogs.slug, slug))
        .limit(1);

      if (!blog) return null;

      // Load tags
      const blogTagsList = await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(blogTags)
        .innerJoin(tags, eq(blogTags.tagId, tags.id))
        .where(eq(blogTags.blogId, blog.id));

      // Load socials
      const socialsMap = await this.getSocialsForAuthors([blog.authorId]);

      return {
        ...blog,
        author: blog.author
          ? mapUserToAuthor({
              ...blog.author,
              socials: socialsMap[blog.author.id] || [],
            })
          : null,
        tags: mapTagList(blogTagsList),
      };
    },

    async findWithTags(id: number) {
      return this.findById(id);
    },

    async create(data: CreateBlogInput) {
      const { tagIds, ...blogData } = data;

      // Auto-generate slug if not provided
      const slug =
        blogData.slug ||
        (await ensureUniqueSlug(generateSlug(blogData.title), async (s) => {
          const existing = await this.findBySlug(s);
          return !!existing;
        }));

      const [newBlog] = await db
        .insert(blogs)
        .values({ ...blogData, slug })
        .returning();

      if (!newBlog) {
        throw new Error("Failed to create blog");
      }

      if (tagIds && tagIds.length > 0) {
        await db
          .insert(blogTags)
          .values(tagIds.map((tagId) => ({ blogId: newBlog.id, tagId })));
      }

      return newBlog;
    },

    async update(
      id: number,
      data: UpdateBlogInput & { slug?: string; tagIds?: number[] },
    ) {
      const { tagIds, ...blogData } = data;
      const sanitizedData = stripUndefinedValues(blogData);

      const [updated] = await db
        .update(blogs)
        .set({
          ...sanitizedData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(blogs.id, id))
        .returning();

      if (tagIds !== undefined) {
        await db.delete(blogTags).where(eq(blogTags.blogId, id));
        if (tagIds.length > 0) {
          await db
            .insert(blogTags)
            .values(tagIds.map((tagId) => ({ blogId: id, tagId })));
        }
      }

      return updated;
    },

    async delete(id: number) {
      const [deleted] = await db
        .delete(blogs)
        .where(eq(blogs.id, id))
        .returning();
      return deleted;
    },

    async findPublished(query: BlogQuery) {
      const { page, limit, search, sortBy, sortOrder, authorId, cursor } =
        query;

      // Build filters - only published blogs
      const conditions = [
        isNotNull(blogs.publishDate),
        lte(blogs.publishDate, sql`CURRENT_TIMESTAMP`),
      ];

      if (authorId) {
        conditions.push(eq(blogs.authorId, authorId));
      }

      const searchCondition = blogQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause = and(...conditions);

      // Build query with author join
      const baseQuery = db
        .select({
          id: blogs.id,
          title: blogs.title,
          slug: blogs.slug,
          excerpt: blogs.excerpt,
          content: blogs.content,
          featuredImageUrl: blogs.featuredImageUrl,
          authorId: blogs.authorId,
          publishDate: blogs.publishDate,
          readTimeMinutes: blogs.readTimeMinutes,
          createdAt: blogs.createdAt,
          updatedAt: blogs.updatedAt,
          author: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        })
        .from(blogs)
        .leftJoin(user, eq(blogs.authorId, user.id));

      const queryWithWhere = baseQuery.where(whereClause);

      const cursorValue = decodeCursorValue<string>(cursor);
      let blogsWithAuthors;
      if (cursorValue) {
        const cursorCondition = lte(blogs.publishDate, cursorValue);
        const cursorWhere = combineWhere(whereClause, cursorCondition);
        const cursorQuery = cursorWhere
          ? baseQuery.where(cursorWhere)
          : baseQuery;
        blogsWithAuthors = await cursorQuery
          .orderBy(desc(blogs.publishDate))
          .limit(limit);
      } else {
        const sortedQuery = blogQueryBuilder.applySort(
          queryWithWhere,
          sortBy,
          sortOrder,
        );
        const finalQuery = blogQueryBuilder.applyPagination(
          sortedQuery,
          page,
          limit,
        );
        blogsWithAuthors = await finalQuery;
      }

      // Load tags for all blogs
      const blogIds = blogsWithAuthors.map((b: { id: number }) => b.id);
      const blogTagsList =
        blogIds.length > 0
          ? await db
              .select({
                blogId: blogTags.blogId,
                tagId: tags.id,
                tagName: tags.name,
                tagSlug: tags.slug,
              })
              .from(blogTags)
              .innerJoin(tags, eq(blogTags.tagId, tags.id))
              .where(inArray(blogTags.blogId, blogIds))
          : [];

      // Group tags by blog
      const tagsByBlog = blogTagsList.reduce(
        (
          acc: Record<
            number,
            Array<{ id: number; name: string; slug: string }>
          >,
          bt: {
            blogId: number;
            tagId: number;
            tagName: string;
            tagSlug: string;
          },
        ) => {
          if (!acc[bt.blogId]) acc[bt.blogId] = [];
          acc[bt.blogId]!.push({
            id: bt.tagId,
            name: bt.tagName,
            slug: bt.tagSlug,
          });
          return acc;
        },
        {},
      );

      // Load socials for authors
      const authorIds = [
        ...new Set(
          blogsWithAuthors
            .map((b: { authorId: string }) => b.authorId)
            .filter(Boolean),
        ),
      ] as string[];

      const socialsByAuthor = await this.getSocialsForAuthors(authorIds);

      // Map items to include author and tags
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedItems = blogsWithAuthors.map((blog: any) => ({
        ...blog,
        author: blog.author
          ? mapUserToAuthor({
              ...blog.author,
              socials: socialsByAuthor[blog.author.id] || [],
            })
          : null,
        tags: mapTagList(tagsByBlog[blog.id] || []),
      }));

      if (cursorValue) {
        const cursorResult = buildCursorResult(
          mappedItems,
          limit,
          (item) => item.publishDate,
        );
        return { ...cursorResult, page, total: undefined };
      }

      const total = await countRecords(db, blogs, whereClause);

      return buildListResult(mappedItems, total, page, limit);
    },

    async findPublishedById(id: number) {
      const [blog] = await db
        .select({
          id: blogs.id,
          title: blogs.title,
          slug: blogs.slug,
          excerpt: blogs.excerpt,
          content: blogs.content,
          featuredImageUrl: blogs.featuredImageUrl,
          authorId: blogs.authorId,
          publishDate: blogs.publishDate,
          readTimeMinutes: blogs.readTimeMinutes,
          createdAt: blogs.createdAt,
          updatedAt: blogs.updatedAt,
          author: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        })
        .from(blogs)
        .leftJoin(user, eq(blogs.authorId, user.id))
        .where(
          and(
            eq(blogs.id, id),
            isNotNull(blogs.publishDate),
            lte(blogs.publishDate, sql`CURRENT_TIMESTAMP`),
          ),
        )
        .limit(1);

      if (!blog) return null;

      // Load tags
      const blogTagsList = await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(blogTags)
        .innerJoin(tags, eq(blogTags.tagId, tags.id))
        .where(eq(blogTags.blogId, id));

      // Load socials
      const socialsMap = await this.getSocialsForAuthors([blog.authorId]);

      return {
        ...blog,
        author: blog.author
          ? mapUserToAuthor({
              ...blog.author,
              socials: socialsMap[blog.author.id] || [],
            })
          : null,
        tags: mapTagList(blogTagsList),
      };
    },

    async findPublishedBySlug(slug: string) {
      const [blog] = await db
        .select({
          id: blogs.id,
          title: blogs.title,
          slug: blogs.slug,
          excerpt: blogs.excerpt,
          content: blogs.content,
          featuredImageUrl: blogs.featuredImageUrl,
          authorId: blogs.authorId,
          publishDate: blogs.publishDate,
          readTimeMinutes: blogs.readTimeMinutes,
          createdAt: blogs.createdAt,
          updatedAt: blogs.updatedAt,
          author: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        })
        .from(blogs)
        .leftJoin(user, eq(blogs.authorId, user.id))
        .where(
          and(
            eq(blogs.slug, slug),
            isNotNull(blogs.publishDate),
            lte(blogs.publishDate, sql`CURRENT_TIMESTAMP`),
          ),
        )
        .limit(1);

      if (!blog) return null;

      // Load tags
      const blogTagsList = await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(blogTags)
        .innerJoin(tags, eq(blogTags.tagId, tags.id))
        .where(eq(blogTags.blogId, blog.id));

      // Load socials
      const socialsMap = await this.getSocialsForAuthors([blog.authorId]);

      return {
        ...blog,
        author: blog.author
          ? mapUserToAuthor({
              ...blog.author,
              socials: socialsMap[blog.author.id] || [],
            })
          : null,
        tags: mapTagList(blogTagsList),
      };
    },
  };
};

export type BlogRepository = ReturnType<typeof createBlogRepository>;
