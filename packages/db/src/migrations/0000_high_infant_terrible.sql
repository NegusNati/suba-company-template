CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'BLOGGER', 'USER');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "blog_tags" (
	"blog_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "blog_tags_blog_id_tag_id_pk" PRIMARY KEY("blog_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"featured_image_url" text,
	"author_id" text NOT NULL,
	"publish_date" timestamp with time zone,
	"read_time_minutes" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug"),
	CONSTRAINT "chk_blogs_slug_format" CHECK ("blogs"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "case_studies" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"overview" text,
	"client_id" integer,
	"project_scope" text,
	"impact" text,
	"problem" text,
	"process" text,
	"deliverable" text,
	"service_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "case_studies_slug_unique" UNIQUE("slug"),
	CONSTRAINT "chk_case_studies_slug_format" CHECK ("case_studies"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "case_study_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_study_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"caption" text,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_study_tags" (
	"case_study_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "case_study_tags_case_study_id_tag_id_pk" PRIMARY KEY("case_study_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"contact" text NOT NULL,
	"message" text NOT NULL,
	"service_id" integer,
	"is_handled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"title" text,
	"description" text,
	"occurred_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"website_url" text,
	"logo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "partners_slug_unique" UNIQUE("slug"),
	CONSTRAINT "chk_partners_slug_format" CHECK ("partners"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment" text NOT NULL,
	"company_name" text NOT NULL,
	"company_logo_url" text,
	"spoke_person_name" text,
	"spoke_person_title" text,
	"spoke_person_headshot_url" text,
	"partner_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_tags" (
	"product_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "product_tags_product_id_tag_id_pk" PRIMARY KEY("product_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"overview" text,
	"product_link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "chk_products_slug_format" CHECK ("products"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "service_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug"),
	CONSTRAINT "chk_services_slug_format" CHECK ("services"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "socials" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"icon_url" text,
	"base_url" text NOT NULL,
	CONSTRAINT "socials_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "user_socials" (
	"profile_id" integer NOT NULL,
	"social_id" integer NOT NULL,
	"handle" text,
	"full_url" text,
	CONSTRAINT "user_socials_profile_id_social_id_pk" PRIMARY KEY("profile_id","social_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug"),
	CONSTRAINT "chk_tags_slug_format" CHECK ("tags"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"headshot_url" text,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"phone_number" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"title" text NOT NULL,
	"manager_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_tags" ADD CONSTRAINT "blog_tags_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "public"."blogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_tags" ADD CONSTRAINT "blog_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_client_id_partners_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_study_images" ADD CONSTRAINT "case_study_images_case_study_id_case_studies_id_fk" FOREIGN KEY ("case_study_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_study_tags" ADD CONSTRAINT "case_study_tags_case_study_id_case_studies_id_fk" FOREIGN KEY ("case_study_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_study_tags" ADD CONSTRAINT "case_study_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_images" ADD CONSTRAINT "service_images_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_socials" ADD CONSTRAINT "user_socials_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_socials" ADD CONSTRAINT "user_socials_social_id_socials_id_fk" FOREIGN KEY ("social_id") REFERENCES "public"."socials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_blogs_publish_date" ON "blogs" USING btree ("publish_date");--> statement-breakpoint
CREATE INDEX "idx_blogs_author" ON "blogs" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_case_studies_client" ON "case_studies" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_case_studies_service" ON "case_studies" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "idx_case_studies_created_at" ON "case_studies" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_contacts_is_handled" ON "contacts" USING btree ("is_handled");--> statement-breakpoint
CREATE INDEX "idx_contacts_service" ON "contacts" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "idx_contacts_created_at" ON "contacts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_faqs_is_active" ON "faqs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_gallery_occurred_at" ON "gallery_items" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "idx_partners_title" ON "partners" USING btree ("title");--> statement-breakpoint
CREATE INDEX "idx_testimonials_partner" ON "testimonials" USING btree ("partner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_product_image_position" ON "product_images" USING btree ("product_id","position");--> statement-breakpoint
CREATE INDEX "idx_products_created_at" ON "products" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_service_image_position" ON "service_images" USING btree ("service_id","position");--> statement-breakpoint
CREATE INDEX "idx_services_title" ON "services" USING btree ("title");--> statement-breakpoint
CREATE INDEX "idx_services_created_at" ON "services" USING btree ("created_at");