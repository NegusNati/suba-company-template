import {
  pgTable,
  serial,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

import { userProfiles } from "./users";

export const socials = pgTable("socials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().unique(),
  iconUrl: text("icon_url"),
  baseUrl: text("base_url").notNull(),
});

export const userSocials = pgTable(
  "user_socials",
  {
    profileId: integer("profile_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    socialId: integer("social_id")
      .notNull()
      .references(() => socials.id, { onDelete: "cascade" }),
    handle: text("handle"),
    fullUrl: text("full_url"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.profileId, table.socialId] }),
  }),
);
