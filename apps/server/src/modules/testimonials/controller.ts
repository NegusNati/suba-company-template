import type { Context } from "hono";

import type { TestimonialService } from "./service";
import {
  createTestimonialSchema,
  createTestimonialFormSchema,
  updateTestimonialSchema,
  updateTestimonialFormSchema,
  testimonialQuerySchema,
  publicTestimonialQuerySchema,
  type TestimonialQuery,
  type PublicTestimonialQuery,
  type TestimonialIdParams,
  type CreateTestimonialInput,
  type UpdateTestimonialInput,
} from "./validators";
import {
  successResponse,
  paginatedResponse,
  ValidationError,
  BadRequestError,
} from "../../core/http";
import {
  uploadTestimonialImage,
  FileUploadError,
} from "../../shared/storage/uploadFile";

import { logger } from "@/shared/logger";

export const createTestimonialController = (service: TestimonialService) => {
  return {
    async listTestimonials(c: Context) {
      const query =
        (c.get("validatedQuery") as TestimonialQuery | undefined) ??
        testimonialQuerySchema.parse(c.req.query());

      const result = await service.getTestimonials(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getTestimonial(c: Context) {
      const { id } =
        (c.get("validatedParams") as TestimonialIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid testimonial ID");
          }
          return { id: parsed };
        })();

      const testimonial = await service.getTestimonialById(id);
      return successResponse(c, testimonial);
    },

    async createTestimonial(c: Context) {
      logger.info("createTestimonial - handling multipart form data");
      try {
        const formData = await c.req.formData();

        const formInput = {
          comment: formData.get("comment"),
          companyName: formData.get("companyName"),
          spokePersonName: formData.get("spokePersonName"),
          spokePersonTitle: formData.get("spokePersonTitle"),
          partnerId: formData.get("partnerId"),
          companyLogo: formData.get("companyLogo"),
          spokePersonHeadshot: formData.get("spokePersonHeadshot"),
        };

        const validatedData = createTestimonialFormSchema.parse(formInput);

        let companyLogoUrl: string | undefined;
        let spokePersonHeadshotUrl: string | undefined;

        if (validatedData.companyLogo) {
          try {
            companyLogoUrl = await uploadTestimonialImage(
              validatedData.companyLogo,
            );
            logger.info(
              `Company logo uploaded successfully: ${companyLogoUrl}`,
            );
          } catch (error) {
            if (error instanceof FileUploadError) {
              throw new BadRequestError(error.message);
            }
            throw error;
          }
        }

        if (validatedData.spokePersonHeadshot) {
          try {
            spokePersonHeadshotUrl = await uploadTestimonialImage(
              validatedData.spokePersonHeadshot,
            );
            logger.info(
              `Headshot uploaded successfully: ${spokePersonHeadshotUrl}`,
            );
          } catch (error) {
            if (error instanceof FileUploadError) {
              throw new BadRequestError(error.message);
            }
            throw error;
          }
        }

        const testimonialData =
          (c.get("validatedBody") as CreateTestimonialInput | undefined) ??
          createTestimonialSchema.parse({
            comment: validatedData.comment,
            companyName: validatedData.companyName,
            spokePersonName: validatedData.spokePersonName,
            spokePersonTitle: validatedData.spokePersonTitle,
            partnerId: validatedData.partnerId,
            companyLogoUrl,
            spokePersonHeadshotUrl,
          });

        logger.info("Creating testimonial with data", {
          companyName: testimonialData.companyName,
        });
        const testimonial = await service.createTestimonial(testimonialData);
        return successResponse(c, testimonial, 201);
      } catch (error) {
        logger.error("Error creating testimonial", error as Error);
        throw error;
      }
    },

    async updateTestimonial(c: Context) {
      const { id } =
        (c.get("validatedParams") as TestimonialIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid testimonial ID");
          }
          return { id: parsed };
        })();

      const contentType = c.req.header("content-type") ?? "";

      if (contentType.includes("multipart/form-data")) {
        logger.info("updateTestimonial - handling multipart form data");
        try {
          const formData = await c.req.formData();

          const formInput = {
            comment: formData.get("comment"),
            companyName: formData.get("companyName"),
            spokePersonName: formData.get("spokePersonName"),
            spokePersonTitle: formData.get("spokePersonTitle"),
            partnerId: formData.get("partnerId"),
            companyLogo: formData.get("companyLogo"),
            companyLogoUrl: formData.get("companyLogoUrl"),
            spokePersonHeadshot: formData.get("spokePersonHeadshot"),
            spokePersonHeadshotUrl: formData.get("spokePersonHeadshotUrl"),
          };

          const validatedData = updateTestimonialFormSchema.parse(formInput);

          let companyLogoUrl = validatedData.companyLogoUrl;
          let spokePersonHeadshotUrl = validatedData.spokePersonHeadshotUrl;

          if (validatedData.companyLogo) {
            try {
              companyLogoUrl = await uploadTestimonialImage(
                validatedData.companyLogo,
              );
              logger.info(
                `Company logo uploaded successfully: ${companyLogoUrl}`,
              );
            } catch (error) {
              if (error instanceof FileUploadError) {
                throw new BadRequestError(error.message);
              }
              throw error;
            }
          }

          if (validatedData.spokePersonHeadshot) {
            try {
              spokePersonHeadshotUrl = await uploadTestimonialImage(
                validatedData.spokePersonHeadshot,
              );
              logger.info(
                `Headshot uploaded successfully: ${spokePersonHeadshotUrl}`,
              );
            } catch (error) {
              if (error instanceof FileUploadError) {
                throw new BadRequestError(error.message);
              }
              throw error;
            }
          }

          const data =
            (c.get("validatedBody") as UpdateTestimonialInput | undefined) ??
            updateTestimonialSchema.parse({
              comment: validatedData.comment,
              companyName: validatedData.companyName,
              spokePersonName: validatedData.spokePersonName,
              spokePersonTitle: validatedData.spokePersonTitle,
              partnerId: validatedData.partnerId,
              companyLogoUrl,
              spokePersonHeadshotUrl,
            });

          const testimonial = await service.updateTestimonial(id, data);
          return successResponse(c, testimonial);
        } catch (error) {
          logger.error("Error updating testimonial", error as Error);
          throw error;
        }
      }

      const body = await c.req.json();
      const data =
        (c.get("validatedBody") as UpdateTestimonialInput | undefined) ??
        updateTestimonialSchema.parse(body);

      const testimonial = await service.updateTestimonial(id, data);
      return successResponse(c, testimonial);
    },

    async deleteTestimonial(c: Context) {
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
        throw new ValidationError("Invalid testimonial ID");
      }

      await service.deleteTestimonial(id);
      return successResponse(c, {
        message: "Testimonial deleted successfully",
      });
    },

    async listPublicTestimonials(c: Context) {
      const query =
        (c.get("validatedQuery") as PublicTestimonialQuery | undefined) ??
        publicTestimonialQuerySchema.parse(c.req.query());

      const result = await service.getPublicTestimonials(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        nextCursor: result.nextCursor,
      });
    },
  };
};

export type TestimonialController = ReturnType<
  typeof createTestimonialController
>;
