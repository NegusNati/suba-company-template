import type { TestimonialRepository } from "./repository";
import {
  mapToTestimonialResponse,
  mapToPublicTestimonialResponse,
} from "./schema";
import type {
  CreateTestimonialInput,
  UpdateTestimonialInput,
  TestimonialQuery,
  PublicTestimonialQuery,
} from "./validators";
import { NotFoundError, ValidationError } from "../../core/http";

export const createTestimonialService = (repository: TestimonialRepository) => {
  return {
    async getTestimonials(query: TestimonialQuery) {
      const result = await repository.findAll(query);
      return {
        ...result,
        items: result.items.map(mapToTestimonialResponse),
      };
    },

    async getTestimonialById(id: number) {
      const testimonial = await repository.findById(id);

      if (!testimonial) {
        throw new NotFoundError(`Testimonial with id ${id} not found`);
      }

      return mapToTestimonialResponse(testimonial);
    },

    async createTestimonial(data: CreateTestimonialInput) {
      try {
        const testimonial = await repository.create(data);
        return mapToTestimonialResponse(testimonial);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.message === "Invalid partner ID") {
          throw new ValidationError("Invalid partner ID provided");
        }
        throw error;
      }
    },

    async updateTestimonial(id: number, data: UpdateTestimonialInput) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Testimonial with id ${id} not found`);
      }

      try {
        const updated = await repository.update(id, data);
        if (!updated) {
          throw new NotFoundError(`Testimonial with id ${id} not found`);
        }
        return mapToTestimonialResponse(updated);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.message === "Invalid partner ID") {
          throw new ValidationError("Invalid partner ID provided");
        }
        throw error;
      }
    },

    async deleteTestimonial(id: number) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Testimonial with id ${id} not found`);
      }

      return await repository.delete(id);
    },

    async getPublicTestimonials(query: PublicTestimonialQuery) {
      const result = await repository.findPublic(query);
      return {
        ...result,
        items: result.items.map(mapToPublicTestimonialResponse),
      };
    },
  };
};

export type TestimonialService = ReturnType<typeof createTestimonialService>;
