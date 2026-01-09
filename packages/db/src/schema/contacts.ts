import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";

import { services } from "./services";

export const contacts = pgTable(
  "contacts",
  {
    id: serial("id").primaryKey(),
    fullName: text("full_name").notNull(),
    contact: text("contact").notNull(),
    message: text("message").notNull(),
    serviceId: integer("service_id").references(() => services.id, {
      onDelete: "set null",
    }),
    isHandled: boolean("is_handled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    idxHandled: index("idx_contacts_is_handled").on(table.isHandled),
    idxService: index("idx_contacts_service").on(table.serviceId),
    idxCreatedAt: index("idx_contacts_created_at").on(table.createdAt),
  }),
);
