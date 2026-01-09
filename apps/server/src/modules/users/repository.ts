import { and, eq, ilike, desc, asc, sql } from "@suba-company-template/db/orm";
import { user, userProfiles, session } from "@suba-company-template/db/schema";
import { socials, userSocials } from "@suba-company-template/db/schema/socials";

import type {
  UserListItem,
  UserDetailResponse,
  UserSocialItem,
} from "./schema";
import type {
  CreateUserInput,
  UpdateUserInput,
  AssignRoleInput,
  UserListQuery,
  UserSocialInput,
  UserSortField,
} from "./validators";
import type { DbClient } from "../../shared/db";
import {
  createQueryBuilder,
  buildListResult,
  countRecords,
} from "../../shared/query";

const userQueryBuilder = createQueryBuilder<typeof user, UserSortField>({
  table: user,
  searchFields: [
    user.name,
    user.email,
    userProfiles.firstName,
    userProfiles.lastName,
  ],
  sortFields: {
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    name: user.name,
    email: user.email,
  },
  defaultSortField: "createdAt",
});

export const createUserRepository = (db: DbClient) => {
  return {
    async findAll(query: UserListQuery) {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        role,
        email,
      } = query;

      const conditions = [];

      // Role is now on the user table
      if (role) {
        conditions.push(eq(user.role, role));
      }

      if (email) {
        conditions.push(ilike(user.email, `%${email}%`));
      }

      const searchCondition = userQueryBuilder.applySearch(search);
      if (searchCondition) {
        conditions.push(searchCondition);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const sortField =
        sortBy === "createdAt"
          ? user.createdAt
          : sortBy === "updatedAt"
            ? user.updatedAt
            : sortBy === "name"
              ? user.name
              : user.email;

      const sortFn = sortOrder === "asc" ? asc : desc;

      const rows = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
        .from(user)
        .leftJoin(userProfiles, eq(user.id, userProfiles.userId))
        .where(whereClause)
        .orderBy(sortFn(sortField))
        .limit(limit)
        .offset((page - 1) * limit);

      const items: UserListItem[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        emailVerified: row.emailVerified,
        image: row.image,
        role: (row.role ?? "user") as "admin" | "blogger" | "user",
        createdAt: row.createdAt.toISOString?.() || String(row.createdAt),
        updatedAt: row.updatedAt.toISOString?.() || String(row.updatedAt),
      }));

      const totalCount = await countRecords(db, user, whereClause);

      return buildListResult(items, totalCount, page, limit);
    },

    async findById(userId: string): Promise<UserDetailResponse | null> {
      const [row] = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          role: user.role,
          profileId: userProfiles.id,
          firstName: userProfiles.firstName,
          lastName: userProfiles.lastName,
          headshotUrl: userProfiles.headshotUrl,
          phoneNumber: userProfiles.phoneNumber,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
        .from(user)
        .leftJoin(userProfiles, eq(user.id, userProfiles.userId))
        .where(eq(user.id, userId))
        .limit(1);

      if (!row) {
        return null;
      }

      // Count user sessions
      const sessionCount = await countRecords(
        db,
        session,
        eq(session.userId, userId),
      );

      // Fetch user's socials if profileId exists
      let userSocialsList: UserSocialItem[] = [];
      if (row.profileId) {
        userSocialsList = await this.findSocialsByProfileId(row.profileId);
      }

      return {
        id: row.id,
        name: row.name,
        email: row.email,
        emailVerified: row.emailVerified,
        image: row.image,
        role: (row.role ?? "user") as "admin" | "blogger" | "user",
        profile: {
          firstName: row.firstName ?? null,
          lastName: row.lastName ?? null,
          headshotUrl: row.headshotUrl ?? null,
          phoneNumber: row.phoneNumber ?? null,
          socials: userSocialsList,
        },
        sessions: sessionCount,
        createdAt: row.createdAt.toISOString?.() || String(row.createdAt),
        updatedAt: row.updatedAt.toISOString?.() || String(row.updatedAt),
      };
    },

    async findByEmail(email: string) {
      const [row] = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      return row || null;
    },

    async createUser(data: CreateUserInput & { passwordHash?: string }) {
      const result = await db.transaction(async (tx) => {
        // Create user in auth table with role
        const [newUser] = await tx
          .insert(user)
          .values({
            id: crypto.randomUUID(),
            name: data.name,
            email: data.email,
            emailVerified: data.emailVerified ?? false,
            image: data.image ?? null,
            role: data.role ?? "user",
            createdAt: sql`now()`,
            updatedAt: sql`now()`,
          })
          .returning({ id: user.id, name: user.name, email: user.email });

        if (!newUser) {
          throw new Error("Failed to create user");
        }

        // Create user profile (without role - role is now on user table)
        await tx.insert(userProfiles).values({
          userId: newUser.id,
          firstName: data.profile?.firstName ?? null,
          lastName: data.profile?.lastName ?? null,
          headshotUrl: data.profile?.headshotUrl ?? null,
          phoneNumber: data.profile?.phoneNumber ?? null,
        });

        return newUser;
      });

      return result;
    },

    async updateUser(
      userId: string,
      data: UpdateUserInput,
    ): Promise<UserDetailResponse | null> {
      await db.transaction(async (tx) => {
        // Update user table (including role now)
        if (
          data.name ||
          data.email ||
          data.emailVerified !== undefined ||
          data.image !== undefined ||
          data.role !== undefined
        ) {
          const updateData: Record<string, unknown> = {
            updatedAt: sql`now()`,
          };

          if (data.name) {
            updateData.name = data.name;
          }
          if (data.email) {
            updateData.email = data.email;
          }
          if (data.emailVerified !== undefined) {
            updateData.emailVerified = data.emailVerified;
          }
          if (data.image !== undefined) {
            updateData.image = data.image;
          }
          if (data.role !== undefined) {
            updateData.role = data.role;
          }

          await tx.update(user).set(updateData).where(eq(user.id, userId));
        }

        // Update user profile (without role)
        if (data.profile) {
          const updates: Record<string, unknown> = {
            updatedAt: sql`now()`,
          };

          const profile = data.profile as Record<string, unknown> | undefined;

          if (profile) {
            if ("firstName" in profile && profile.firstName !== undefined) {
              updates.firstName = profile.firstName ?? null;
            }
            if ("lastName" in profile && profile.lastName !== undefined) {
              updates.lastName = profile.lastName ?? null;
            }
            if ("headshotUrl" in profile && profile.headshotUrl !== undefined) {
              updates.headshotUrl = profile.headshotUrl ?? null;
            }
            if ("phoneNumber" in profile && profile.phoneNumber !== undefined) {
              updates.phoneNumber = profile.phoneNumber ?? null;
            }
          }

          await tx
            .update(userProfiles)
            .set(updates)
            .where(eq(userProfiles.userId, userId));
        }
      });

      return this.findById(userId);
    },

    async updateRole(userId: string, roleData: AssignRoleInput) {
      // Role is now on the user table
      await db
        .update(user)
        .set({
          role: roleData.role,
          updatedAt: sql`now()`,
        })
        .where(eq(user.id, userId));

      return { role: roleData.role };
    },

    async deleteUser(userId: string) {
      // Cascade delete is handled by DB constraints
      // Delete from user table which cascades to profiles, sessions, etc.
      await db.delete(user).where(eq(user.id, userId));
    },

    async getAdminCount() {
      // Role is now on the user table
      return await countRecords(db, user, eq(user.role, "admin"));
    },

    async findSocialsByProfileId(profileId: number): Promise<UserSocialItem[]> {
      const result = await db
        .select({
          socialId: userSocials.socialId,
          handle: userSocials.handle,
          fullUrl: userSocials.fullUrl,
          socialTitle: socials.title,
          socialIconUrl: socials.iconUrl,
          socialBaseUrl: socials.baseUrl,
        })
        .from(userSocials)
        .innerJoin(socials, eq(userSocials.socialId, socials.id))
        .where(eq(userSocials.profileId, profileId));

      return result;
    },

    async getProfileIdByUserId(userId: string): Promise<number | null> {
      const [result] = await db
        .select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);

      return result?.id ?? null;
    },

    async updateUserSocials(
      profileId: number,
      socialsData: UserSocialInput[],
    ): Promise<void> {
      // Get existing socials
      const existingSocials = await this.findSocialsByProfileId(profileId);
      const existingSocialIds = existingSocials.map((s) => s.socialId);
      const newSocialIds = socialsData.map((s) => s.socialId);

      // Upsert new/updated socials
      for (const social of socialsData) {
        await db
          .insert(userSocials)
          .values({
            profileId,
            socialId: social.socialId,
            handle: social.handle ?? null,
            fullUrl: social.fullUrl ?? null,
          })
          .onConflictDoUpdate({
            target: [userSocials.profileId, userSocials.socialId],
            set: {
              handle: social.handle ?? null,
              fullUrl: social.fullUrl ?? null,
            },
          });
      }

      // Delete removed socials
      const socialsToDelete = existingSocialIds.filter(
        (id) => !newSocialIds.includes(id),
      );
      for (const socialId of socialsToDelete) {
        await db
          .delete(userSocials)
          .where(
            and(
              eq(userSocials.profileId, profileId),
              eq(userSocials.socialId, socialId),
            ),
          );
      }
    },
  };
};

export type UserRepository = ReturnType<typeof createUserRepository>;
