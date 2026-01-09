import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

// Role is now managed by Better Auth admin plugin on the user table
// Roles: "admin", "blogger", "user" (lowercase)

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  headshotUrl: text("headshot_url"),
  phoneNumber: text("phone_number"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});
