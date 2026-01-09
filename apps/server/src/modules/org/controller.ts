import type { Context } from "hono";

import type { OrgService } from "./service";
import {
  createOrgMemberSchema,
  updateOrgMemberSchema,
  orgQuerySchema,
  publicOrgQuerySchema,
  createOrgMemberFormSchema,
  updateOrgMemberFormSchema,
  type OrgQuery,
  type PublicOrgQuery,
  type OrgMemberIdParams,
  type CreateOrgMemberInput,
  type UpdateOrgMemberInput,
} from "./validators";
import {
  successResponse,
  paginatedResponse,
  ValidationError,
  BadRequestError,
} from "../../core/http";
import {
  uploadOrgHeadshot,
  FileUploadError,
} from "../../shared/storage/uploadFile";

export const createOrgController = (service: OrgService) => {
  return {
    async listOrgMembers(c: Context) {
      const query =
        (c.get("validatedQuery") as OrgQuery | undefined) ??
        orgQuerySchema.parse(c.req.query());

      const result = await service.getOrgMembers(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getOrgMember(c: Context) {
      const { id } =
        (c.get("validatedParams") as OrgMemberIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid member ID");
          }
          return { id: parsed };
        })();

      const member = await service.getOrgMember(id);
      return successResponse(c, member);
    },

    async createOrgMember(c: Context) {
      const contentType = c.req.header("content-type") ?? "";
      const normalizedContentType = contentType.toLowerCase();
      if (normalizedContentType.includes("multipart/form-data")) {
        const formData = await c.req.formData();

        const formInput = {
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          title: formData.get("title"),
          managerId: formData.get("managerId"),
          image: formData.get("image"),
        };

        const validatedForm = createOrgMemberFormSchema.parse(formInput);

        let headshotUrl: string | undefined;
        if (validatedForm.image) {
          try {
            headshotUrl = await uploadOrgHeadshot(validatedForm.image);
          } catch (error) {
            if (error instanceof FileUploadError) {
              throw new BadRequestError(error.message);
            }
            throw error;
          }
        }

        const payload: Record<string, unknown> = {
          firstName: validatedForm.firstName,
          lastName: validatedForm.lastName,
          title: validatedForm.title,
        };

        if (validatedForm.managerId !== undefined) {
          payload.managerId = validatedForm.managerId;
        }
        if (headshotUrl !== undefined) {
          payload.headshotUrl = headshotUrl;
        }

        const memberData =
          (c.get("validatedBody") as CreateOrgMemberInput | undefined) ??
          createOrgMemberSchema.parse(payload);

        const member = await service.createOrgMember(memberData);
        return successResponse(c, member, 201);
      }

      const data =
        (c.get("validatedBody") as CreateOrgMemberInput | undefined) ??
        createOrgMemberSchema.parse(await c.req.json());

      const member = await service.createOrgMember(data);
      return successResponse(c, member, 201);
    },

    async updateOrgMember(c: Context) {
      const { id } =
        (c.get("validatedParams") as OrgMemberIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid member ID");
          }
          return { id: parsed };
        })();

      const contentType = c.req.header("content-type") ?? "";
      const normalizedContentType = contentType.toLowerCase();
      if (normalizedContentType.includes("multipart/form-data")) {
        const formData = await c.req.formData();
        const formInput = {
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          title: formData.get("title"),
          managerId: formData.get("managerId"),
          image: formData.get("image"),
          imageUrl: formData.get("imageUrl"),
        };

        const validatedForm = updateOrgMemberFormSchema.parse(formInput);

        // Handle image: new upload takes priority, otherwise keep imageUrl
        let headshotUrl: string | undefined = validatedForm.imageUrl;
        if (validatedForm.image) {
          try {
            headshotUrl = await uploadOrgHeadshot(validatedForm.image);
          } catch (error) {
            if (error instanceof FileUploadError) {
              throw new BadRequestError(error.message);
            }
            throw error;
          }
        }

        const payload: Record<string, unknown> = {};

        if (validatedForm.firstName !== undefined) {
          payload.firstName = validatedForm.firstName;
        }
        if (validatedForm.lastName !== undefined) {
          payload.lastName = validatedForm.lastName;
        }
        if (validatedForm.title !== undefined) {
          payload.title = validatedForm.title;
        }
        if (validatedForm.managerId !== undefined) {
          payload.managerId = validatedForm.managerId;
        }
        if (headshotUrl !== undefined) {
          payload.headshotUrl = headshotUrl;
        }

        const memberData =
          (c.get("validatedBody") as UpdateOrgMemberInput | undefined) ??
          updateOrgMemberSchema.parse(payload);

        const member = await service.updateOrgMember(id, memberData);
        return successResponse(c, member);
      }

      const data =
        (c.get("validatedBody") as UpdateOrgMemberInput | undefined) ??
        updateOrgMemberSchema.parse(await c.req.json());

      const member = await service.updateOrgMember(id, data);
      return successResponse(c, member);
    },

    async deleteOrgMember(c: Context) {
      const { id } =
        (c.get("validatedParams") as OrgMemberIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid member ID");
          }
          return { id: parsed };
        })();

      const result = await service.deleteOrgMember(id);
      return successResponse(c, result);
    },

    async getPublicOrg(c: Context) {
      const query =
        (c.get("validatedQuery") as PublicOrgQuery | undefined) ??
        publicOrgQuerySchema.parse(c.req.query());

      const result = await service.getPublicOrg(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },
  };
};

export type OrgController = ReturnType<typeof createOrgController>;
