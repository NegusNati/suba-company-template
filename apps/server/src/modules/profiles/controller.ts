import type { Context } from "hono";

import type { ProfileService } from "./service";
import { updateProfileSchema, updateProfileFormSchema } from "./validators";
import { successResponse, BadRequestError } from "../../core/http";
import {
  uploadProfileHeadshot,
  FileUploadError,
} from "../../shared/storage/uploadFile";

import { logger } from "@/shared/logger";

export const createProfileController = (service: ProfileService) => ({
  async getMyProfile(c: Context) {
    const user = c.get("user");
    const profile = await service.getCurrentProfile(user.id);
    return successResponse(c, profile);
  },

  async updateMyProfile(c: Context) {
    const user = c.get("user");
    logger.info("updateMyProfile - handling multipart form data");
    try {
      const formData = await c.req.formData();

      const formInput = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phoneNumber: formData.get("phoneNumber"),
        socials: formData.get("socials"),
        headshot: formData.get("headshot"),
      };

      const validatedData = updateProfileFormSchema.parse(formInput);

      let headshotUrl: string | undefined;
      if (validatedData.headshot) {
        try {
          headshotUrl = await uploadProfileHeadshot(validatedData.headshot);
          logger.info(`Profile headshot uploaded successfully: ${headshotUrl}`);
        } catch (error) {
          if (error instanceof FileUploadError) {
            throw new BadRequestError(error.message);
          }
          throw error;
        }
      }

      const profileData = updateProfileSchema.parse({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phoneNumber: validatedData.phoneNumber,
        socials: validatedData.socials,
        headshotUrl,
      });

      logger.info("Updating profile for user", { userId: user.id });
      const profile = await service.updateCurrentProfile(user.id, profileData);
      return successResponse(c, profile);
    } catch (error) {
      logger.error("Error updating profile", error as Error);
      throw error;
    }
  },
});

export type ProfileController = ReturnType<typeof createProfileController>;
