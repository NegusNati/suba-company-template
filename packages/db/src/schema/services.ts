import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  uniqueIndex,
  index,
  check,
  primaryKey,
} from "drizzle-orm/pg-core";

import { tags } from "./tags";

export const services = pgTable(
  "services",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    chkSlugFormat: check(
      "chk_services_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
    idxTitle: index("idx_services_title").on(table.title),
    idxCreatedAt: index("idx_services_created_at").on(table.createdAt),
  }),
);

export const serviceImages = pgTable(
  "service_images",
  {
    id: serial("id").primaryKey(),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    position: integer("position").default(0).notNull(),
  },
  (table) => ({
    uniqServicePosition: uniqueIndex("uniq_service_image_position").on(
      table.serviceId,
      table.position,
    ),
  }),
);

export const serviceTags = pgTable(
  "service_tags",
  {
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.serviceId, table.tagId] }),
  }),
);
