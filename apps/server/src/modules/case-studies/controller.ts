import type { Context } from "hono";

import type { CaseStudyService } from "./service";
import {
  createCaseStudySchema,
  createCaseStudyFormSchema,
  updateCaseStudySchema,
  updateCaseStudyFormSchema,
  caseStudyQuerySchema,
  publicCaseStudyQuerySchema,
  type CaseStudyQuery,
  type PublicCaseStudyQuery,
  type CaseStudyIdParams,
  type CreateCaseStudyInput,
  type UpdateCaseStudyInput,
} from "./validators";
import {
  successResponse,
  paginatedResponse,
  ValidationError,
  BadRequestError,
} from "../../core/http";
import {
  uploadCaseStudyImage,
  FileUploadError,
} from "../../shared/storage/uploadFile";

import { logger } from "@/shared/logger";

export const createCaseStudyController = (service: CaseStudyService) => {
  return {
    async listCaseStudies(c: Context) {
      const query =
        (c.get("validatedQuery") as CaseStudyQuery | undefined) ??
        caseStudyQuerySchema.parse(c.req.query());

      const result = await service.getCaseStudies(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getCaseStudy(c: Context) {
      const { id } =
        (c.get("validatedParams") as CaseStudyIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid case study ID");
          }
          return { id: parsed };
        })();
      const includeRelations = c.req.query("includeRelations") === "true";

      const caseStudy = await service.getCaseStudyById(id, includeRelations);
      return successResponse(c, caseStudy);
    },

    async createCaseStudy(c: Context) {
      logger.info("createCaseStudy - handling multipart form data");
      try {
        const formData = await c.req.formData();
        const formInput = {
          title: formData.get("title"),
          slug: formData.get("slug"),
          excerpt: formData.get("excerpt"),
          overview: formData.get("overview"),
          clientId: formData.get("clientId"),
          projectScope: formData.get("projectScope"),
          impact: formData.get("impact"),
          problem: formData.get("problem"),
          process: formData.get("process"),
          deliverable: formData.get("deliverable"),
          serviceId: formData.get("serviceId"),
          tagIds: formData.get("tagIds"),
          imagesMeta: formData.get("imagesMeta"),
        };

        const validatedData = createCaseStudyFormSchema.parse(formInput);
        const uploadedImages: Array<{
          imageUrl: string;
          caption?: string;
          position: number;
        }> = [];

        if (validatedData.imagesMeta && validatedData.imagesMeta.length > 0) {
          for (let i = 0; i < validatedData.imagesMeta.length; i++) {
            const imageFile = formData.get(`images[${i}]`) as File | null;
            if (imageFile) {
              try {
                const imageUrl = await uploadCaseStudyImage(imageFile);
                uploadedImages.push({
                  imageUrl,
                  caption: validatedData.imagesMeta[i].caption,
                  position: validatedData.imagesMeta[i].position || i,
                });
              } catch (error) {
                if (error instanceof FileUploadError) {
                  throw new BadRequestError(error.message);
                }
                throw error;
              }
            }
          }
        }

        const caseStudyData =
          (c.get("validatedBody") as CreateCaseStudyInput | undefined) ??
          createCaseStudySchema.parse({
            title: validatedData.title,
            slug: validatedData.slug,
            excerpt: validatedData.excerpt,
            overview: validatedData.overview,
            clientId: validatedData.clientId,
            projectScope: validatedData.projectScope,
            impact: validatedData.impact,
            problem: validatedData.problem,
            process: validatedData.process,
            deliverable: validatedData.deliverable,
            serviceId: validatedData.serviceId,
            tagIds: validatedData.tagIds,
            images: uploadedImages.length > 0 ? uploadedImages : undefined,
          });

        const caseStudy = await service.createCaseStudy(caseStudyData);
        return successResponse(c, caseStudy, 201);
      } catch (error) {
        logger.error("Error creating case study", error as Error);
        throw error;
      }
    },

    async updateCaseStudy(c: Context) {
      const { id } =
        (c.get("validatedParams") as CaseStudyIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid case study ID");
          }
          return { id: parsed };
        })();

      const contentType = c.req.header("content-type") ?? "";

      if (contentType.includes("multipart/form-data")) {
        logger.info("updateCaseStudy - handling multipart form data");
        try {
          const formData = await c.req.formData();
          const formInput = {
            title: formData.get("title"),
            slug: formData.get("slug"),
            excerpt: formData.get("excerpt"),
            overview: formData.get("overview"),
            clientId: formData.get("clientId"),
            projectScope: formData.get("projectScope"),
            impact: formData.get("impact"),
            problem: formData.get("problem"),
            process: formData.get("process"),
            deliverable: formData.get("deliverable"),
            serviceId: formData.get("serviceId"),
            tagIds: formData.get("tagIds"),
            imagesMeta: formData.get("imagesMeta"),
          };

          const validatedData = updateCaseStudyFormSchema.parse(formInput);
          const uploadedImages: Array<{
            imageUrl: string;
            caption?: string;
            position: number;
          }> = [];

          if (validatedData.imagesMeta !== undefined) {
            for (let i = 0; i < validatedData.imagesMeta.length; i++) {
              const imageFile = formData.get(`images[${i}]`) as File | null;
              let imageUrl = validatedData.imagesMeta[i].imageUrl;

              if (imageFile) {
                try {
                  imageUrl = await uploadCaseStudyImage(imageFile);
                } catch (error) {
                  if (error instanceof FileUploadError) {
                    throw new BadRequestError(error.message);
                  }
                  throw error;
                }
              }

              if (!imageUrl) {
                throw new BadRequestError(
                  "Each image entry must include an imageUrl or upload a file",
                );
              }

              uploadedImages.push({
                imageUrl,
                caption: validatedData.imagesMeta[i].caption,
                position:
                  validatedData.imagesMeta[i].position !== undefined
                    ? validatedData.imagesMeta[i].position
                    : i,
              });
            }
          }

          const data =
            (c.get("validatedBody") as UpdateCaseStudyInput | undefined) ??
            updateCaseStudySchema.parse({
              title: validatedData.title,
              slug: validatedData.slug,
              excerpt: validatedData.excerpt,
              overview: validatedData.overview,
              clientId: validatedData.clientId,
              projectScope: validatedData.projectScope,
              impact: validatedData.impact,
              problem: validatedData.problem,
              process: validatedData.process,
              deliverable: validatedData.deliverable,
              serviceId: validatedData.serviceId,
              tagIds: validatedData.tagIds,
              images:
                validatedData.imagesMeta !== undefined
                  ? uploadedImages
                  : undefined,
            });

          const caseStudy = await service.updateCaseStudy(id, data);
          return successResponse(c, caseStudy);
        } catch (error) {
          logger.error("Error updating case study", error as Error);
          throw error;
        }
      }

      const body = await c.req.json();
      const data =
        (c.get("validatedBody") as UpdateCaseStudyInput | undefined) ??
        updateCaseStudySchema.parse(body);

      const caseStudy = await service.updateCaseStudy(id, data);
      return successResponse(c, caseStudy);
    },

    async deleteCaseStudy(c: Context) {
      const { id } =
        (c.get("validatedParams") as CaseStudyIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"));
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid case study ID");
          }
          return { id: parsed };
        })();

      await service.deleteCaseStudy(id);
      return successResponse(c, {
        message: "Case study deleted successfully",
      });
    },

    async listPublicCaseStudies(c: Context) {
      const query =
        (c.get("validatedQuery") as PublicCaseStudyQuery | undefined) ??
        publicCaseStudyQuerySchema.parse(c.req.query());

      const result = await service.getPublicCaseStudies(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        nextCursor: result.nextCursor,
      });
    },

    async getPublicCaseStudyBySlug(c: Context) {
      const slug = c.req.param("slug");

      const caseStudy = await service.getPublicCaseStudyBySlug(slug);
      return successResponse(c, caseStudy);
    },
  };
};

export type CaseStudyController = ReturnType<typeof createCaseStudyController>;
