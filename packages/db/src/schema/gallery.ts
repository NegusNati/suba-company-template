import { pgTable, serial, text, timestamp, index } from "drizzle-orm/pg-core";

export const galleryItems = pgTable(
  "gallery_items",
  {
    id: serial("id").primaryKey(),
    imageUrl: text("image_url").notNull(),
    title: text("title"),
    description: text("description"),
    occurredAt: timestamp("occurred_at", {
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
    idxOccurredAt: index("idx_gallery_occurred_at").on(table.occurredAt),
  }),
);
