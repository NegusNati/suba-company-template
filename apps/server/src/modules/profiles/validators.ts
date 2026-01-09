import { z } from "zod";

const urlRefine = (val: string) =>
  val.startsWith("http") || val.startsWith("/");
const urlErrorMessage = "Must be a valid URL or relative path starting with /";

export const userSocialSchema = z.object({
  socialId: z.number().int().positive(),
  handle: z.string().min(1).max(255).optional().nullable(),
  fullUrl: z.string().refine(urlRefine, urlErrorMessage).optional().nullable(),
});

export const updateProfileSchema = z
  .object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    phoneNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
      .optional()
      .nullable(),
    headshotUrl: z
      .string()
      .refine(urlRefine, urlErrorMessage)
      .optional()
      .nullable(),
    socials: z.array(userSocialSchema).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

// Schema for multipart form data (used in controller)
export const updateProfileFormSchema = z
  .object({
    firstName: z
      .string()
      .min(1)
      .max(100)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    lastName: z
      .string()
      .min(1)
      .max(100)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    phoneNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
    socials: z
      .string()
      .nullable()
      .transform((val) =>
        val === null ? undefined : val ? JSON.parse(val) : undefined,
      )
      .optional()
      .refine(
        (val) =>
          val === undefined ||
          (Array.isArray(val) &&
            val.every(
              (s) =>
                typeof s === "object" &&
                Number.isInteger(s.socialId) &&
                s.socialId > 0,
            )),
        "socials must be an array of valid social objects",
      ),
    headshot: z
      .instanceof(File)
      .nullable()
      .transform((val) => (val === null ? undefined : val))
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const IMMUTABLE_PROFILE_FIELDS = [
  "id",
  "userId",
  "role",
  "createdAt",
  "updatedAt",
] as const;

export type UserSocialInput = z.infer<typeof userSocialSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateProfileFormInput = z.infer<typeof updateProfileFormSchema>;
