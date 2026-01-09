import { sql } from "drizzle-orm";
import {
  pgEnum,
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

export const vacancyWorkplaceTypeEnum = pgEnum("vacancy_workplace_type", [
  "ONSITE",
  "REMOTE",
  "HYBRID",
]);

export const vacancyEmploymentTypeEnum = pgEnum("vacancy_employment_type", [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "TEMP",
]);

export const vacancySeniorityEnum = pgEnum("vacancy_seniority", [
  "ENTRY",
  "MID",
  "SENIOR",
  "LEAD",
  "EXECUTIVE",
]);

export const vacancyStatusEnum = pgEnum("vacancy_status", [
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
]);

export const vacancyApplicationStatusEnum = pgEnum(
  "vacancy_application_status",
  ["SUBMITTED", "REVIEWING", "SHORTLISTED", "REJECTED", "HIRED"],
);

export const vacancies = pgTable(
  "vacancies",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt"),
    description: text("description").notNull(),
    featuredImageUrl: text("featured_image_url"),
    department: text("department"),
    location: text("location"),
    workplaceType: vacancyWorkplaceTypeEnum("workplace_type"),
    employmentType: vacancyEmploymentTypeEnum("employment_type"),
    seniority: vacancySeniorityEnum("seniority"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryCurrency: text("salary_currency"),
    externalApplyUrl: text("external_apply_url"),
    applyEmail: text("apply_email"),
    status: vacancyStatusEnum("status").notNull().default("DRAFT"),
    publishedAt: timestamp("published_at", {
      withTimezone: true,
      mode: "string",
    }),
    deadlineAt: timestamp("deadline_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    chkSlugFormat: check(
      "chk_vacancies_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
    chkSalaryRange: check(
      "chk_vacancies_salary_range",
      sql`(${table.salaryMin} IS NULL OR ${table.salaryMax} IS NULL OR ${table.salaryMin} <= ${table.salaryMax})`,
    ),
    idxStatus: index("idx_vacancies_status").on(table.status),
    idxPublishedAt: index("idx_vacancies_published_at").on(table.publishedAt),
    idxDeadlineAt: index("idx_vacancies_deadline_at").on(table.deadlineAt),
    idxCreatedAt: index("idx_vacancies_created_at").on(table.createdAt),
  }),
);

export const vacancyTags = pgTable(
  "vacancy_tags",
  {
    vacancyId: integer("vacancy_id")
      .notNull()
      .references(() => vacancies.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.vacancyId, table.tagId] }),
  }),
);

export const vacancyApplications = pgTable(
  "vacancy_applications",
  {
    id: serial("id").primaryKey(),
    vacancyId: integer("vacancy_id")
      .notNull()
      .references(() => vacancies.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    resumeUrl: text("resume_url"),
    portfolioUrl: text("portfolio_url"),
    linkedinUrl: text("linkedin_url"),
    coverLetter: text("cover_letter"),
    status: vacancyApplicationStatusEnum("status")
      .notNull()
      .default("SUBMITTED"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    reviewedAt: timestamp("reviewed_at", {
      withTimezone: true,
      mode: "string",
    }),
    notes: text("notes"),
  },
  (table) => ({
    idxVacancyId: index("idx_vacancy_applications_vacancy_id").on(
      table.vacancyId,
    ),
    idxStatus: index("idx_vacancy_applications_status").on(table.status),
    idxCreatedAt: index("idx_vacancy_applications_created_at").on(
      table.createdAt,
    ),
  }),
);
