import type { ContactRepository } from "./repository";
import type {
  CreateContactInput,
  UpdateContactInput,
  ContactsQuery,
  PublicContactsQuery,
} from "./validators";
import { NotFoundError } from "../../core/http";

export const createContactService = (repository: ContactRepository) => {
  return {
    async getContacts(query: ContactsQuery) {
      return await repository.findAll(query);
    },

    async getContact(id: number) {
      const contact = await repository.findById(id);

      if (!contact) {
        throw new NotFoundError(`Contact with id ${id} not found`);
      }

      return contact;
    },

    async createContact(data: CreateContactInput) {
      return await repository.create(data);
    },

    async updateContact(id: number, data: UpdateContactInput) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Contact with id ${id} not found`);
      }

      return await repository.update(id, data);
    },

    async deleteContact(id: number) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Contact with id ${id} not found`);
      }

      return await repository.delete(id);
    },

    async getPublicContacts(query: PublicContactsQuery) {
      const clampedQuery = {
        ...query,
        limit: Math.min(query.limit, 50),
      };

      return await repository.findPublic(clampedQuery);
    },
  };
};

export type ContactService = ReturnType<typeof createContactService>;
