import { and, eq } from "@suba-company-template/db/orm";
import { user } from "@suba-company-template/db/schema/auth";
import { socials, userSocials } from "@suba-company-template/db/schema/socials";
import { userProfiles } from "@suba-company-template/db/schema/users";

import type { DbClient } from "../../shared/db";

interface UpdateProfileData {
  firstName?: string | null;
  lastName?: string | null;
  headshotUrl?: string | null;
  phoneNumber?: string | null;
}

interface UserSocialData {
  socialId: number;
  handle?: string | null;
  fullUrl?: string | null;
}

export const createProfileRepository = (db: DbClient) => ({
  async findByUserId(userId: string) {
    const result = await db
      .select({
        id: userProfiles.id,
        userId: userProfiles.userId,
        firstName: userProfiles.firstName,
        lastName: userProfiles.lastName,
        headshotUrl: userProfiles.headshotUrl,
        role: user.role,
        phoneNumber: userProfiles.phoneNumber,
        createdAt: userProfiles.createdAt,
        updatedAt: userProfiles.updatedAt,
        email: user.email,
        userImage: user.image,
        userName: user.name,
      })
      .from(userProfiles)
      .innerJoin(user, eq(userProfiles.userId, user.id))
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    return result[0] || null;
  },

  async upsertProfile(userId: string, data: UpdateProfileData) {
    const now = new Date().toISOString();
    const [profile] = await db
      .insert(userProfiles)
      .values({
        userId,
        ...data,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: { ...data, updatedAt: now },
      })
      .returning();

    return profile;
  },

  async findSocialsByProfileId(profileId: number) {
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

  async upsertUserSocial(profileId: number, socialData: UserSocialData) {
    await db
      .insert(userSocials)
      .values({
        profileId,
        socialId: socialData.socialId,
        handle: socialData.handle,
        fullUrl: socialData.fullUrl,
      })
      .onConflictDoUpdate({
        target: [userSocials.profileId, userSocials.socialId],
        set: {
          handle: socialData.handle,
          fullUrl: socialData.fullUrl,
        },
      });
  },

  async deleteUserSocial(profileId: number, socialId: number) {
    await db
      .delete(userSocials)
      .where(
        and(
          eq(userSocials.profileId, profileId),
          eq(userSocials.socialId, socialId),
        ),
      );
  },
});

export type ProfileRepository = ReturnType<typeof createProfileRepository>;
