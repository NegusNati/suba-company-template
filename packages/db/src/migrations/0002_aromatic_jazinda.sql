CREATE TYPE "public"."vacancy_application_status" AS ENUM('SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED');--> statement-breakpoint
CREATE TYPE "public"."vacancy_employment_type" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMP');--> statement-breakpoint
CREATE TYPE "public"."vacancy_seniority" AS ENUM('ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE');--> statement-breakpoint
CREATE TYPE "public"."vacancy_status" AS ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."vacancy_workplace_type" AS ENUM('ONSITE', 'REMOTE', 'HYBRID');--> statement-breakpoint
CREATE TABLE "vacancies" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"description" text NOT NULL,
	"featured_image_url" text,
	"department" text,
	"location" text,
	"workplace_type" "vacancy_workplace_type",
	"employment_type" "vacancy_employment_type",
	"seniority" "vacancy_seniority",
	"salary_min" integer,
	"salary_max" integer,
	"salary_currency" text,
	"external_apply_url" text,
	"apply_email" text,
	"status" "vacancy_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp with time zone,
	"deadline_at" timestamp with time zone,
	"created_by_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vacancies_slug_unique" UNIQUE("slug"),
	CONSTRAINT "chk_vacancies_slug_format" CHECK ("vacancies"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
	CONSTRAINT "chk_vacancies_salary_range" CHECK (("vacancies"."salary_min" IS NULL OR "vacancies"."salary_max" IS NULL OR "vacancies"."salary_min" <= "vacancies"."salary_max"))
);
--> statement-breakpoint
CREATE TABLE "vacancy_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"vacancy_id" integer NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"resume_url" text,
	"portfolio_url" text,
	"linkedin_url" text,
	"cover_letter" text,
	"status" "vacancy_application_status" DEFAULT 'SUBMITTED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "vacancy_tags" (
	"vacancy_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "vacancy_tags_vacancy_id_tag_id_pk" PRIMARY KEY("vacancy_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancy_applications" ADD CONSTRAINT "vacancy_applications_vacancy_id_vacancies_id_fk" FOREIGN KEY ("vacancy_id") REFERENCES "public"."vacancies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancy_tags" ADD CONSTRAINT "vacancy_tags_vacancy_id_vacancies_id_fk" FOREIGN KEY ("vacancy_id") REFERENCES "public"."vacancies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancy_tags" ADD CONSTRAINT "vacancy_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_vacancies_status" ON "vacancies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_vacancies_published_at" ON "vacancies" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_vacancies_deadline_at" ON "vacancies" USING btree ("deadline_at");--> statement-breakpoint
CREATE INDEX "idx_vacancies_created_at" ON "vacancies" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_vacancy_applications_vacancy_id" ON "vacancy_applications" USING btree ("vacancy_id");--> statement-breakpoint
CREATE INDEX "idx_vacancy_applications_status" ON "vacancy_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_vacancy_applications_created_at" ON "vacancy_applications" USING btree ("created_at");