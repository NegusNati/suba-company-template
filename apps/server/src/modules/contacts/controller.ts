import type { Context } from "hono";

import type { ContactService } from "./service";
import {
  createContactSchema,
  updateContactSchema,
  contactsQuerySchema,
  publicContactsQuerySchema,
  type CreateContactInput,
  type UpdateContactInput,
  type ContactsQuery,
  type PublicContactsQuery,
  type ContactIdParams,
} from "./validators";
import {
  successResponse,
  paginatedResponse,
  ValidationError,
} from "../../core/http";
import { logger } from "../../shared/logger";

export const createContactController = (service: ContactService) => {
  return {
    async listContacts(c: Context) {
      const query =
        (c.get("validatedQuery") as ContactsQuery | undefined) ??
        contactsQuerySchema.parse(c.req.query());

      const result = await service.getContacts(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getContact(c: Context) {
      const { id } =
        (c.get("validatedParams") as ContactIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed))
            throw new ValidationError("Invalid contact ID");
          return { id: parsed };
        })();

      const contact = await service.getContact(id);
      return successResponse(c, contact);
    },

    async createContact(c: Context) {
      try {
        const requestId = c.get("requestId");

        const data =
          (c.get("validatedBody") as CreateContactInput | undefined) ??
          createContactSchema.parse(await c.req.json());

        logger.debug("Contact data validated", { data, requestId });

        const contact = await service.createContact(data);
        logger.info("Contact created successfully", {
          contactId: contact.id,
          requestId,
        });

        return successResponse(c, contact, 201);
      } catch (error) {
        const requestId = c.get("requestId");
        logger.error("Failed to create contact", error as Error, { requestId });
        throw error;
      }
    },

    async updateContact(c: Context) {
      const { id } =
        (c.get("validatedParams") as ContactIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed))
            throw new ValidationError("Invalid contact ID");
          return { id: parsed };
        })();

      const data =
        (c.get("validatedBody") as UpdateContactInput | undefined) ??
        updateContactSchema.parse(await c.req.json());

      const contact = await service.updateContact(id, data);
      return successResponse(c, contact);
    },

    async deleteContact(c: Context) {
      const { id } =
        (c.get("validatedParams") as ContactIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed))
            throw new ValidationError("Invalid contact ID");
          return { id: parsed };
        })();

      await service.deleteContact(id);
      return successResponse(c, { message: "Contact deleted successfully" });
    },

    async listPublicContacts(c: Context) {
      const query =
        (c.get("validatedQuery") as PublicContactsQuery | undefined) ??
        publicContactsQuerySchema.parse(c.req.query());

      const result = await service.getPublicContacts(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },
  };
};

export type ContactController = ReturnType<typeof createContactController>;
