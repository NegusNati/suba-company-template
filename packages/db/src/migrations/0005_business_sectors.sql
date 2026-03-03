CREATE TABLE "business_sectors" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL,
  "excerpt" text,
  "history" text NOT NULL,
  "featured_image_url" text,
  "phone_number" text,
  "email_address" text,
  "address" text,
  "facebook_url" text,
  "instagram_url" text,
  "linkedin_url" text,
  "publish_date" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "business_sectors_slug_unique" UNIQUE ("slug"),
  CONSTRAINT "chk_business_sectors_slug_format" CHECK ("business_sectors"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
--> statement-breakpoint

CREATE TABLE "business_sector_stats" (
  "id" serial PRIMARY KEY NOT NULL,
  "sector_id" integer NOT NULL,
  "stat_key" text NOT NULL,
  "stat_value" text NOT NULL,
  "position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint

CREATE TABLE "business_sector_services" (
  "id" serial PRIMARY KEY NOT NULL,
  "sector_id" integer NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "image_url" text,
  "position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint

CREATE TABLE "business_sector_gallery_images" (
  "id" serial PRIMARY KEY NOT NULL,
  "sector_id" integer NOT NULL,
  "image_url" text NOT NULL,
  "position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint

ALTER TABLE "business_sector_stats"
  ADD CONSTRAINT "business_sector_stats_sector_id_business_sectors_id_fk"
  FOREIGN KEY ("sector_id")
  REFERENCES "public"."business_sectors"("id")
  ON DELETE cascade
  ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "business_sector_services"
  ADD CONSTRAINT "business_sector_services_sector_id_business_sectors_id_fk"
  FOREIGN KEY ("sector_id")
  REFERENCES "public"."business_sectors"("id")
  ON DELETE cascade
  ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "business_sector_gallery_images"
  ADD CONSTRAINT "business_sector_gallery_images_sector_id_business_sectors_id_fk"
  FOREIGN KEY ("sector_id")
  REFERENCES "public"."business_sectors"("id")
  ON DELETE cascade
  ON UPDATE no action;
--> statement-breakpoint

CREATE INDEX "idx_business_sectors_publish_date"
  ON "business_sectors" USING btree ("publish_date");
--> statement-breakpoint

CREATE INDEX "idx_business_sectors_created_at"
  ON "business_sectors" USING btree ("created_at");
