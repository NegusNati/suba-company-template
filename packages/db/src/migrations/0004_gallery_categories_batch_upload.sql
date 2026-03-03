CREATE TABLE "gallery_categories" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "is_system" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "gallery_categories_name_unique" UNIQUE ("name"),
  CONSTRAINT "gallery_categories_slug_unique" UNIQUE ("slug"),
  CONSTRAINT "chk_gallery_categories_slug_format" CHECK ("gallery_categories"."slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
--> statement-breakpoint

INSERT INTO "gallery_categories" ("name", "slug", "is_system")
VALUES ('Uncategorized', 'uncategorized', true)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint

ALTER TABLE "gallery_items"
  ADD COLUMN "image_urls" text[],
  ADD COLUMN "category_id" integer;
--> statement-breakpoint

UPDATE "gallery_items"
SET
  "image_urls" = ARRAY["image_url"],
  "category_id" = (
    SELECT "id"
    FROM "gallery_categories"
    WHERE "slug" = 'uncategorized'
    LIMIT 1
  ),
  "title" = COALESCE("title", 'Untitled');
--> statement-breakpoint

ALTER TABLE "gallery_items"
  ALTER COLUMN "image_urls" SET NOT NULL,
  ALTER COLUMN "category_id" SET NOT NULL,
  ALTER COLUMN "title" SET NOT NULL;
--> statement-breakpoint

ALTER TABLE "gallery_items"
  ADD CONSTRAINT "gallery_items_category_id_gallery_categories_id_fk"
  FOREIGN KEY ("category_id")
  REFERENCES "public"."gallery_categories"("id")
  ON DELETE restrict
  ON UPDATE no action;
--> statement-breakpoint

CREATE INDEX "idx_gallery_category_id"
  ON "gallery_items" USING btree ("category_id");
--> statement-breakpoint

ALTER TABLE "gallery_items"
  DROP COLUMN "image_url";
