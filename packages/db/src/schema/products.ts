import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  uniqueIndex,
  primaryKey,
  index,
  check,
} from "drizzle-orm/pg-core";

import { tags } from "./tags";

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    overview: text("overview"),
    productLink: text("product_link"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    chkSlugFormat: check(
      "chk_products_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
    idxCreatedAt: index("idx_products_created_at").on(table.createdAt),
  }),
);

export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    position: integer("position").default(0).notNull(),
  },
  (table) => ({
    uniqProductPosition: uniqueIndex("uniq_product_image_position").on(
      table.productId,
      table.position,
    ),
  }),
);

export const productTags = pgTable(
  "product_tags",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.tagId] }),
  }),
);
