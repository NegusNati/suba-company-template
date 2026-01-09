import { sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp, check } from "drizzle-orm/pg-core";

export const tags = pgTable(
  "tags",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    chkSlugFormat: check(
      "chk_tags_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
  }),
);
