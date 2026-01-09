import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  index,
  check,
} from "drizzle-orm/pg-core";

export const partners = pgTable(
  "partners",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    websiteUrl: text("website_url"),
    logoUrl: text("logo_url"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    chkSlugFormat: check(
      "chk_partners_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
    idxTitle: index("idx_partners_title").on(table.title),
  }),
);

export const testimonials = pgTable(
  "testimonials",
  {
    id: serial("id").primaryKey(),
    comment: text("comment").notNull(),
    companyName: text("company_name").notNull(),
    companyLogoUrl: text("company_logo_url"),
    spokePersonName: text("spoke_person_name"),
    spokePersonTitle: text("spoke_person_title"),
    spokePersonHeadshotUrl: text("spoke_person_headshot_url"),
    partnerId: integer("partner_id").references(() => partners.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    idxPartner: index("idx_testimonials_partner").on(table.partnerId),
  }),
);
