import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const businessSectors = pgTable(
  "business_sectors",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt"),
    history: text("history").notNull(),
    featuredImageUrl: text("featured_image_url"),
    phoneNumber: text("phone_number"),
    emailAddress: text("email_address"),
    address: text("address"),
    facebookUrl: text("facebook_url"),
    instagramUrl: text("instagram_url"),
    linkedinUrl: text("linkedin_url"),
    publishDate: timestamp("publish_date", {
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
    chkSlugFormat: check(
      "chk_business_sectors_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
    idxPublishDate: index("idx_business_sectors_publish_date").on(
      table.publishDate,
    ),
    idxCreatedAt: index("idx_business_sectors_created_at").on(table.createdAt),
  }),
);

export const businessSectorStats = pgTable("business_sector_stats", {
  id: serial("id").primaryKey(),
  sectorId: integer("sector_id")
    .notNull()
    .references(() => businessSectors.id, { onDelete: "cascade" }),
  statKey: text("stat_key").notNull(),
  statValue: text("stat_value").notNull(),
  position: integer("position").default(0).notNull(),
});

export const businessSectorServices = pgTable("business_sector_services", {
  id: serial("id").primaryKey(),
  sectorId: integer("sector_id")
    .notNull()
    .references(() => businessSectors.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  position: integer("position").default(0).notNull(),
});

export const businessSectorGalleryImages = pgTable(
  "business_sector_gallery_images",
  {
    id: serial("id").primaryKey(),
    sectorId: integer("sector_id")
      .notNull()
      .references(() => businessSectors.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    position: integer("position").default(0).notNull(),
  },
);
