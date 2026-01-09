import type { Context } from "hono";

import type { UserService } from "./service";
import {
  createUserSchema,
  updateUserSchema,
  assignRoleSchema,
  userListQuerySchema,
  type CreateUserInput,
  type UpdateUserInput,
  type AssignRoleInput,
  type UserListQuery,
  type UserIdParams,
} from "./validators";
import {
  successResponse,
  paginatedResponse,
  ValidationError,
  ForbiddenError,
  BadRequestError,
} from "../../core/http";
import { logger } from "../../shared/logger";
import {
  uploadProfileHeadshot,
  uploadUserAvatar,
  FileUploadError,
} from "../../shared/storage/uploadFile";

export const createUserController = (service: UserService) => {
  return {
    async listUsers(c: Context) {
      const query =
        (c.get("validatedQuery") as UserListQuery | undefined) ??
        userListQuerySchema.parse(c.req.query());

      const result = await service.listUsers(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getUser(c: Context) {
      const { userId } =
        (c.get("validatedParams") as UserIdParams | undefined) ??
        (() => {
          const id = c.req.param("userId");
          if (!id) throw new ValidationError("User ID is required");
          return { userId: id };
        })();

      const user = await service.getUser(userId);
      return successResponse(c, user);
    },

    async createUser(c: Context) {
      const contentType = c.req.header("content-type") ?? "";

      if (contentType.includes("multipart/form-data")) {
        logger.info("createUser - handling multipart form data");
        try {
          const formData = await c.req.formData();
          const getString = (value: unknown) =>
            typeof value === "string" ? value : undefined;

          const profileRaw = formData.get("profile");
          let profile: Record<string, unknown> | undefined;
          if (typeof profileRaw === "string" && profileRaw.trim()) {
            try {
              const parsed = JSON.parse(profileRaw);
              if (
                parsed &&
                typeof parsed === "object" &&
                !Array.isArray(parsed)
              ) {
                profile = parsed as Record<string, unknown>;
              } else {
                throw new Error("Profile must be an object");
              }
            } catch (error) {
              throw new BadRequestError(
                `Invalid profile payload: ${(error as Error).message}`,
              );
            }
          }

          const emailVerifiedVal = getString(formData.get("emailVerified"));
          const emailVerified =
            emailVerifiedVal === undefined
              ? undefined
              : emailVerifiedVal === "true";

          let image = getString(formData.get("imageUrl"));
          const avatarFile = formData.get("image") as File | null;
          if (avatarFile) {
            try {
              image = await uploadUserAvatar(avatarFile);
              logger.info(`User avatar uploaded successfully: ${image}`);
            } catch (error) {
              if (error instanceof FileUploadError) {
                throw new BadRequestError(error.message);
              }
              throw error;
            }
          }

          let headshotUrl =
            profile && typeof profile["headshotUrl"] === "string"
              ? (profile["headshotUrl"] as string)
              : undefined;
          const headshotFile = formData.get("profileHeadshot") as File | null;
          if (headshotFile) {
            try {
              headshotUrl = await uploadProfileHeadshot(headshotFile);
              logger.info(
                `Profile headshot uploaded successfully: ${headshotUrl}`,
              );
            } catch (error) {
              if (error instanceof FileUploadError) {
                throw new BadRequestError(error.message);
              }
              throw error;
            }
          }

          const data = createUserSchema.parse({
            name: getString(formData.get("name")),
            email: getString(formData.get("email")),
            password: getString(formData.get("password")),
            emailVerified,
            role: getString(formData.get("role")),
            image,
            profile:
              profile || headshotUrl
                ? { ...(profile ?? {}), headshotUrl }
                : undefined,
          });

          logger.info("Creating user", { email: data.email });

          const user = await service.createUser(data);
          return successResponse(c, user, 201);
        } catch (error) {
          logger.error("Error creating user", error as Error);
          throw error;
        }
      }

      const body = await c.req.json();
      const data =
        (c.get("validatedBody") as CreateUserInput | undefined) ??
        createUserSchema.parse(body);

      logger.info("Creating user", { email: data.email });

      const user = await service.createUser(data);
      return successResponse(c, user, 201);
    },

    async updateUser(c: Context) {
      const { userId } =
        (c.get("validatedParams") as UserIdParams | undefined) ??
        (() => {
          const id = c.req.param("userId");
          if (!id) throw new ValidationError("User ID is required");
          return { userId: id };
        })();

      const contentType = c.req.header("content-type") ?? "";

      if (contentType.includes("multipart/form-data")) {
        logger.info("updateUser - handling multipart form data");
        try {
          const formData = await c.req.formData();
          const getString = (value: unknown) =>
            typeof value === "string" ? value : undefined;

          const profileRaw = formData.get("profile");
          let profile: Record<string, unknown> | undefined;
          if (typeof profileRaw === "string" && profileRaw.trim()) {
            try {
              const parsed = JSON.parse(profileRaw);
              if (
                parsed &&
                typeof parsed === "object" &&
                !Array.isArray(parsed)
              ) {
                profile = parsed as Record<string, unknown>;
              } else {
                throw new Error("Profile must be an object");
              }
            } catch (error) {
              throw new BadRequestError(
                `Invalid profile payload: ${(error as Error).message}`,
              );
            }
          }

          // Parse socials from form data (JSON array)
          const socialsRaw = formData.get("socials");
          let socials:
            | {
                socialId: number;
                handle?: string | null;
                fullUrl?: string | null;
              }[]
            | undefined;
          if (typeof socialsRaw === "string" && socialsRaw.trim()) {
            try {
              const parsed = JSON.parse(socialsRaw);
              if (Array.isArray(parsed)) {
                socials = parsed;
              } else {
                throw new Error("Socials must be an array");
              }
            } catch (error) {
              throw new BadRequestError(
                `Invalid socials payload: ${(error as Error).message}`,
              );
            }
          }

          const emailVerifiedVal = getString(formData.get("emailVerified"));
          const emailVerified =
            emailVerifiedVal === undefined
              ? undefined
              : emailVerifiedVal === "true";

          let image = getString(formData.get("imageUrl"));
          const avatarFile = formData.get("image") as File | null;
          if (avatarFile) {
            try {
              image = await uploadUserAvatar(avatarFile);
              logger.info(`User avatar uploaded successfully: ${image}`);
            } catch (error) {
              if (error instanceof FileUploadError) {
                throw new BadRequestError(error.message);
              }
              throw error;
            }
          }

          let headshotUrl =
            profile && typeof profile["headshotUrl"] === "string"
              ? (profile["headshotUrl"] as string)
              : undefined;
          const headshotFile = formData.get("profileHeadshot") as File | null;
          if (headshotFile) {
            try {
              headshotUrl = await uploadProfileHeadshot(headshotFile);
              logger.info(
                `Profile headshot uploaded successfully: ${headshotUrl}`,
              );
            } catch (error) {
              if (error instanceof FileUploadError) {
                throw new BadRequestError(error.message);
              }
              throw error;
            }
          }

          const mergedProfile =
            profile || headshotUrl !== undefined
              ? { ...(profile ?? {}), headshotUrl }
              : undefined;

          const data = updateUserSchema.parse({
            name: getString(formData.get("name")),
            email: getString(formData.get("email")),
            role: getString(formData.get("role")),
            emailVerified,
            image,
            profile: mergedProfile,
            socials,
          });

          logger.info("Updating user", { userId });

          const user = await service.updateUser(userId, data);
          return successResponse(c, user);
        } catch (error) {
          logger.error("Error updating user", error as Error);
          throw error;
        }
      }

      const body = await c.req.json();
      const data =
        (c.get("validatedBody") as UpdateUserInput | undefined) ??
        updateUserSchema.parse(body);

      logger.info("Updating user", { userId });

      const user = await service.updateUser(userId, data);
      return successResponse(c, user);
    },

    async assignRole(c: Context) {
      const { userId } =
        (c.get("validatedParams") as UserIdParams | undefined) ??
        (() => {
          const id = c.req.param("userId");
          if (!id) throw new ValidationError("User ID is required");
          return { userId: id };
        })();

      const actor = c.get("user");
      if (!actor) {
        throw new ForbiddenError("Authentication required");
      }

      const body = await c.req.json();
      const data =
        (c.get("validatedBody") as AssignRoleInput | undefined) ??
        assignRoleSchema.parse(body);

      logger.info("Assigning role", { userId, role: data.role });

      await service.assignRole(userId, data, actor.id);

      return successResponse(c, { message: "Role assigned successfully" });
    },

    async deleteUser(c: Context) {
      const userId = c.req.param("userId");

      if (!userId) {
        throw new ValidationError("User ID is required");
      }

      const actor = c.get("user");
      if (!actor) {
        throw new ForbiddenError("Authentication required");
      }

      logger.info("Deleting user", { userId, actorId: actor.id });

      await service.deleteUser(userId, actor.id);

      return successResponse(c, { message: "User deleted successfully" });
    },

    async getRoles(c: Context) {
      const roles = await service.getRoles();
      return successResponse(c, roles);
    },
  };
};

export type UserController = ReturnType<typeof createUserController>;
