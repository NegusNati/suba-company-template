import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  primaryKey,
  index,
  check,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { tags } from "./tags";

export const blogs = pgTable(
  "blogs",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    featuredImageUrl: text("featured_image_url"),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    publishDate: timestamp("publish_date", {
      withTimezone: true,
      mode: "string",
    }),
    readTimeMinutes: integer("read_time_minutes"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    chkSlugFormat: check(
      "chk_blogs_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
    idxPublishDate: index("idx_blogs_publish_date").on(table.publishDate),
    idxAuthor: index("idx_blogs_author").on(table.authorId),
  }),
);

export const blogTags = pgTable(
  "blog_tags",
  {
    blogId: integer("blog_id")
      .notNull()
      .references(() => blogs.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.blogId, table.tagId] }),
  }),
);
