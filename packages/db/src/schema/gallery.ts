import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  index,
  integer,
  boolean,
  check,
} from "drizzle-orm/pg-core";

export const galleryCategories = pgTable(
  "gallery_categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    isSystem: boolean("is_system").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    chkSlugFormat: check(
      "chk_gallery_categories_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
  }),
);

export const galleryItems = pgTable(
  "gallery_items",
  {
    id: serial("id").primaryKey(),
    imageUrls: text("image_urls").array().notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => galleryCategories.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description"),
    occurredAt: timestamp("occurred_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    idxOccurredAt: index("idx_gallery_occurred_at").on(table.occurredAt),
    idxCategoryId: index("idx_gallery_category_id").on(table.categoryId),
  }),
);
