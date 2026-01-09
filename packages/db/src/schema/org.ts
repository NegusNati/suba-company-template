import { relations } from "drizzle-orm";
import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

// Company structure (org chart) with self-referencing manager relationship
export const companyMembers = pgTable("company_members", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  title: text("title").notNull(),
  headshotUrl: text("headshot_url"),
  managerId: integer("manager_id"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const companyMembersRelations = relations(
  companyMembers,
  ({ one, many }) => ({
    manager: one(companyMembers, {
      fields: [companyMembers.managerId],
      references: [companyMembers.id],
      relationName: "manager",
    }),
    directReports: many(companyMembers, { relationName: "manager" }),
  }),
);
