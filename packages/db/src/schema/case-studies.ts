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

import { partners } from "./partners";
import { services } from "./services";
import { tags } from "./tags";

export const caseStudies = pgTable(
  "case_studies",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt"),
    overview: text("overview"),
    clientId: integer("client_id").references(() => partners.id, {
      onDelete: "set null",
    }),
    projectScope: text("project_scope"),
    impact: text("impact"),
    problem: text("problem"),
    process: text("process"),
    deliverable: text("deliverable"),
    serviceId: integer("service_id").references(() => services.id, {
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
    chkSlugFormat: check(
      "chk_case_studies_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
    idxClient: index("idx_case_studies_client").on(table.clientId),
    idxService: index("idx_case_studies_service").on(table.serviceId),
    idxCreatedAt: index("idx_case_studies_created_at").on(table.createdAt),
  }),
);

export const caseStudyImages = pgTable("case_study_images", {
  id: serial("id").primaryKey(),
  caseStudyId: integer("case_study_id")
    .notNull()
    .references(() => caseStudies.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  position: integer("position").default(0).notNull(),
});

export const caseStudyTags = pgTable(
  "case_study_tags",
  {
    caseStudyId: integer("case_study_id")
      .notNull()
      .references(() => caseStudies.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.caseStudyId, table.tagId] }),
  }),
);
