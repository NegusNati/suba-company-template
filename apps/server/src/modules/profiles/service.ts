import type { ProfileRepository } from "./repository";
import type { UpdateProfileInput } from "./validators";
import { NotFoundError } from "../../core/http";

export const createProfileService = (repository: ProfileRepository) => ({
  async getCurrentProfile(userId: string) {
    let profile = await repository.findByUserId(userId);

    if (!profile) {
      await repository.upsertProfile(userId, {
        firstName: null,
        lastName: null,
      });
      profile = await repository.findByUserId(userId);

      if (!profile) {
        throw new NotFoundError("Profile not found");
      }
    }

    const socials = await repository.findSocialsByProfileId(profile.id);

    return {
      ...profile,
      socials,
    };
  },

  async updateCurrentProfile(userId: string, data: UpdateProfileInput) {
    const { socials, ...profileData } = data;
    const sanitizedData = { ...profileData };
    delete (sanitizedData as Record<string, unknown>).role;

    await repository.upsertProfile(userId, sanitizedData);

    const updated = await repository.findByUserId(userId);
    if (!updated) {
      throw new NotFoundError("Profile not found after update");
    }

    if (socials) {
      const existingSocials = await repository.findSocialsByProfileId(
        updated.id,
      );
      const existingSocialIds = existingSocials.map((s) => s.socialId);
      const newSocialIds = socials.map((s) => s.socialId);

      for (const social of socials) {
        await repository.upsertUserSocial(updated.id, social);
      }

      const socialsToDelete = existingSocialIds.filter(
        (id) => !newSocialIds.includes(id),
      );
      for (const socialId of socialsToDelete) {
        await repository.deleteUserSocial(updated.id, socialId);
      }
    }

    const profileWithSocials = await this.getCurrentProfile(userId);
    return profileWithSocials;
  },
});

export type ProfileService = ReturnType<typeof createProfileService>;
