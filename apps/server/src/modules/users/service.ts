import type { UserRepository } from "./repository";
import type {
  CreateUserInput,
  UpdateUserInput,
  AssignRoleInput,
  UserListQuery,
} from "./validators";
import { NotFoundError, ConflictError, ForbiddenError } from "../../core/http";
import { logger } from "../../shared/logger";

export const createUserService = (repository: UserRepository) => {
  return {
    async listUsers(query: UserListQuery) {
      return await repository.findAll(query);
    },

    async getUser(userId: string) {
      const user = await repository.findById(userId);

      if (!user) {
        throw new NotFoundError(`User with id ${userId} not found`);
      }

      return user;
    },

    async createUser(data: CreateUserInput) {
      // Check email uniqueness
      const existingUser = await repository.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictError(`User with email ${data.email} already exists`);
      }

      const newUser = await repository.createUser(data);

      logger.info("User created", {
        userId: newUser.id,
        email: newUser.email,
      });

      return newUser;
    },

    async updateUser(userId: string, data: UpdateUserInput) {
      const existing = await repository.findById(userId);

      if (!existing) {
        throw new NotFoundError(`User with id ${userId} not found`);
      }

      // Check email uniqueness if email is being changed
      if (data.email && data.email !== existing.email) {
        const conflictingUser = await repository.findByEmail(data.email);
        if (conflictingUser) {
          throw new ConflictError(
            `User with email ${data.email} already exists`,
          );
        }
      }

      // Extract socials from data before updating user profile
      const { socials, ...userData } = data;

      const updated = await repository.updateUser(userId, userData);

      if (!updated) {
        throw new NotFoundError(
          `User with id ${userId} not found after update`,
        );
      }

      // Handle socials update if provided
      if (socials !== undefined) {
        const profileId = await repository.getProfileIdByUserId(userId);
        if (profileId) {
          await repository.updateUserSocials(profileId, socials);
        }
      }

      // Refetch to get updated socials
      const finalUser = await repository.findById(userId);

      logger.info("User updated", { userId, changes: Object.keys(data) });

      return finalUser;
    },

    async assignRole(userId: string, data: AssignRoleInput, actorId: string) {
      const existing = await repository.findById(userId);

      if (!existing) {
        throw new NotFoundError(`User with id ${userId} not found`);
      }

      // Prevent actor from demoting themselves
      if (
        userId === actorId &&
        existing.role === "admin" &&
        data.role !== "admin"
      ) {
        throw new ForbiddenError("Cannot remove your own admin role");
      }

      // Check if removing last admin
      if (existing.role === "admin" && data.role !== "admin") {
        const adminCount = await repository.getAdminCount();
        if (adminCount <= 1) {
          throw new ForbiddenError(
            "Cannot remove the last admin user from the system",
          );
        }
      }

      const updated = await repository.updateRole(userId, data);

      if (!updated) {
        throw new NotFoundError(
          `User with id ${userId} not found after role update`,
        );
      }

      logger.info("User role updated", {
        userId,
        previousRole: existing.role,
        newRole: data.role,
        actorId,
      });

      return updated;
    },

    async deleteUser(userId: string, actorId: string) {
      const user = await repository.findById(userId);

      if (!user) {
        throw new NotFoundError(`User with id ${userId} not found`);
      }

      // Prevent self-deletion
      if (userId === actorId) {
        throw new ForbiddenError("Cannot delete your own account");
      }

      // Check if deleting last admin
      if (user.role === "admin") {
        const adminCount = await repository.getAdminCount();
        if (adminCount <= 1) {
          throw new ForbiddenError(
            "Cannot delete the last admin user from the system",
          );
        }
      }

      await repository.deleteUser(userId);

      logger.info("User deleted", {
        userId,
        email: user.email,
        actorId,
      });

      return { success: true };
    },

    async getRoles() {
      return [
        { value: "admin", label: "Administrator" },
        { value: "blogger", label: "Blogger" },
        { value: "user", label: "User" },
      ];
    },
  };
};

export type UserService = ReturnType<typeof createUserService>;
