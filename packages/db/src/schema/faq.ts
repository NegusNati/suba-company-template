import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const faqs = pgTable(
  "faqs",
  {
    id: serial("id").primaryKey(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    idxActive: index("idx_faqs_is_active").on(table.isActive),
  }),
);
