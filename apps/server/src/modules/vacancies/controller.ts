import type { Context } from "hono";

import type { VacancyService } from "./service";
import {
  createVacancySchema,
  createVacancyFormSchema,
  updateVacancySchema,
  updateVacancyFormSchema,
  vacancyQuerySchema,
  publicVacancyQuerySchema,
  vacancyIdParamSchema,
  vacancyApplicationIdParamSchema,
  vacancyApplicationQuerySchema,
  createVacancyApplicationFormSchema,
  createVacancyApplicationSchema,
  updateVacancyApplicationSchema,
  type CreateVacancyFormInput,
  type PublicVacancyQuery,
  type UpdateVacancyFormInput,
  type VacancyApplicationIdParams,
  type VacancyApplicationQuery,
  type VacancyIdParams,
  type VacancyQuery,
} from "./validators";
import {
  BadRequestError,
  paginatedResponse,
  successResponse,
  ValidationError,
} from "../../core/http";
import {
  FileUploadError,
  uploadVacancyFeaturedImage,
  uploadVacancyResume,
} from "../../shared/storage/uploadFile";
import { stripUndefinedValues } from "../../shared/utils/object";

export const createVacancyController = (service: VacancyService) => {
  return {
    async listVacancies(c: Context) {
      const query =
        (c.get("validatedQuery") as VacancyQuery | undefined) ??
        vacancyQuerySchema.parse(c.req.query());

      const result = await service.getVacancies(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getVacancy(c: Context) {
      const { id } =
        (c.get("validatedParams") as VacancyIdParams | undefined) ??
        vacancyIdParamSchema.parse(c.req.param());

      const vacancy = await service.getVacancyById(id);
      return successResponse(c, vacancy);
    },

    async getVacancyBySlug(c: Context) {
      const slug = c.req.param("slug");
      const vacancy = await service.getVacancyBySlug(slug);
      return successResponse(c, vacancy);
    },

    async createVacancy(c: Context) {
      const user = c.get("user") as { id: string } | undefined;
      if (!user?.id) {
        throw new ValidationError("Authentication required");
      }

      const formData = await c.req.formData();

      const formInput: Record<keyof CreateVacancyFormInput, unknown> = {
        title: formData.get("title"),
        slug: formData.get("slug"),
        excerpt: formData.get("excerpt"),
        description: formData.get("description"),
        department: formData.get("department"),
        location: formData.get("location"),
        workplaceType: formData.get("workplaceType"),
        employmentType: formData.get("employmentType"),
        seniority: formData.get("seniority"),
        salaryMin: formData.get("salaryMin"),
        salaryMax: formData.get("salaryMax"),
        salaryCurrency: formData.get("salaryCurrency"),
        externalApplyUrl: formData.get("externalApplyUrl"),
        applyEmail: formData.get("applyEmail"),
        status: formData.get("status"),
        publishedAt: formData.get("publishedAt"),
        deadlineAt: formData.get("deadlineAt"),
        tagIds: formData.get("tagIds"),
        featuredImageUrl: formData.get("featuredImageUrl"),
        featuredImage: formData.get("featuredImage"),
      };

      const validatedData = createVacancyFormSchema.parse(formInput);

      let featuredImageUrl = validatedData.featuredImageUrl;
      if (validatedData.featuredImage) {
        try {
          featuredImageUrl = await uploadVacancyFeaturedImage(
            validatedData.featuredImage,
          );
        } catch (error) {
          if (error instanceof FileUploadError) {
            throw new BadRequestError(error.message);
          }
          throw error;
        }
      }

      const vacancyData = createVacancySchema.parse({
        title: validatedData.title,
        slug: validatedData.slug,
        excerpt: validatedData.excerpt,
        description: validatedData.description,
        featuredImageUrl,
        department: validatedData.department,
        location: validatedData.location,
        workplaceType: validatedData.workplaceType,
        employmentType: validatedData.employmentType,
        seniority: validatedData.seniority,
        salaryMin: validatedData.salaryMin,
        salaryMax: validatedData.salaryMax,
        salaryCurrency: validatedData.salaryCurrency,
        externalApplyUrl: validatedData.externalApplyUrl,
        applyEmail: validatedData.applyEmail,
        status: validatedData.status,
        publishedAt: validatedData.publishedAt,
        deadlineAt: validatedData.deadlineAt,
        tagIds: validatedData.tagIds,
      });

      const vacancy = await service.createVacancy(user.id, vacancyData);
      return successResponse(c, vacancy, 201);
    },

    async updateVacancy(c: Context) {
      const { id } =
        (c.get("validatedParams") as VacancyIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"), 10);
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid vacancy ID");
          }
          return { id: parsed };
        })();

      const contentType = c.req.header("content-type") ?? "";

      if (contentType.includes("multipart/form-data")) {
        const formData = await c.req.formData();

        const formInput: Record<keyof UpdateVacancyFormInput, unknown> = {
          title: formData.get("title"),
          excerpt: formData.get("excerpt"),
          description: formData.get("description"),
          department: formData.get("department"),
          location: formData.get("location"),
          workplaceType: formData.get("workplaceType"),
          employmentType: formData.get("employmentType"),
          seniority: formData.get("seniority"),
          salaryMin: formData.get("salaryMin"),
          salaryMax: formData.get("salaryMax"),
          salaryCurrency: formData.get("salaryCurrency"),
          externalApplyUrl: formData.get("externalApplyUrl"),
          applyEmail: formData.get("applyEmail"),
          status: formData.get("status"),
          publishedAt: formData.get("publishedAt"),
          deadlineAt: formData.get("deadlineAt"),
          tagIds: formData.get("tagIds"),
          featuredImageUrl: formData.get("featuredImageUrl"),
          featuredImage: formData.get("featuredImage"),
        };

        const validatedData = updateVacancyFormSchema.parse(formInput);

        let featuredImageUrl = validatedData.featuredImageUrl;
        if (validatedData.featuredImage) {
          try {
            featuredImageUrl = await uploadVacancyFeaturedImage(
              validatedData.featuredImage,
            );
          } catch (error) {
            if (error instanceof FileUploadError) {
              throw new BadRequestError(error.message);
            }
            throw error;
          }
        }

        const data = stripUndefinedValues({
          title: validatedData.title,
          excerpt: validatedData.excerpt,
          description: validatedData.description,
          department: validatedData.department,
          location: validatedData.location,
          workplaceType: validatedData.workplaceType,
          employmentType: validatedData.employmentType,
          seniority: validatedData.seniority,
          salaryMin: validatedData.salaryMin,
          salaryMax: validatedData.salaryMax,
          salaryCurrency: validatedData.salaryCurrency,
          externalApplyUrl: validatedData.externalApplyUrl,
          applyEmail: validatedData.applyEmail,
          status: validatedData.status,
          publishedAt: validatedData.publishedAt,
          deadlineAt: validatedData.deadlineAt,
          tagIds: validatedData.tagIds,
          featuredImageUrl,
        });

        const vacancy = await service.updateVacancy(
          id,
          updateVacancySchema.parse(data),
        );

        return successResponse(c, vacancy);
      }

      const body =
        (c.get("validatedBody") as unknown | undefined) ?? (await c.req.json());
      const data = updateVacancySchema.parse(body);

      const vacancy = await service.updateVacancy(id, data);
      return successResponse(c, vacancy);
    },

    async deleteVacancy(c: Context) {
      const { id } =
        (c.get("validatedParams") as VacancyIdParams | undefined) ??
        vacancyIdParamSchema.parse(c.req.param());

      const result = await service.deleteVacancy(id);
      return successResponse(c, result);
    },

    async listPublicVacancies(c: Context) {
      const query =
        (c.get("validatedQuery") as PublicVacancyQuery | undefined) ??
        publicVacancyQuerySchema.parse(c.req.query());

      const result = await service.getPublicVacancies(query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getPublicVacancyBySlug(c: Context) {
      const slug = c.req.param("slug");
      const vacancy = await service.getPublicVacancyBySlug(slug);
      return successResponse(c, vacancy);
    },

    async getPublicVacancyById(c: Context) {
      const id = parseInt(c.req.param("id"), 10);
      if (Number.isNaN(id)) {
        throw new ValidationError("Invalid vacancy ID");
      }

      const vacancy = await service.getPublicVacancyById(id);
      return successResponse(c, vacancy);
    },

    async submitApplication(c: Context) {
      const { id: vacancyId } =
        (c.get("validatedParams") as VacancyIdParams | undefined) ??
        (() => {
          const parsed = Number.parseInt(c.req.param("id"), 10);
          if (Number.isNaN(parsed)) {
            throw new ValidationError("Invalid vacancy ID");
          }
          return { id: parsed };
        })();

      const formData = await c.req.formData();
      const formInput = {
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        resume: formData.get("resume"),
        portfolioUrl: formData.get("portfolioUrl"),
        linkedinUrl: formData.get("linkedinUrl"),
        coverLetter: formData.get("coverLetter"),
        honeypot: formData.get("honeypot"),
      };

      const validated = createVacancyApplicationFormSchema.parse(formInput);

      // Honeypot anti-spam: accept but silently drop submissions
      if (validated.honeypot && validated.honeypot.trim().length > 0) {
        return successResponse(c, { message: "Application received" }, 201);
      }

      let resumeUrl: string | undefined;
      if (validated.resume) {
        try {
          resumeUrl = await uploadVacancyResume(validated.resume);
        } catch (error) {
          if (error instanceof FileUploadError) {
            throw new BadRequestError(error.message);
          }
          throw error;
        }
      }

      const payload = createVacancyApplicationSchema.parse({
        fullName: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        resumeUrl,
        portfolioUrl: validated.portfolioUrl,
        linkedinUrl: validated.linkedinUrl,
        coverLetter: validated.coverLetter,
      });

      const application = await service.submitApplication(vacancyId, payload);
      return successResponse(
        c,
        {
          id: application.id,
          status: application.status,
          createdAt: application.createdAt,
        },
        201,
      );
    },

    async listApplications(c: Context) {
      const { id: vacancyId } =
        (c.get("validatedParams") as VacancyIdParams | undefined) ??
        vacancyIdParamSchema.parse(c.req.param());

      const query =
        (c.get("validatedQuery") as VacancyApplicationQuery | undefined) ??
        vacancyApplicationQuerySchema.parse(c.req.query());

      const result = await service.getApplicationsForVacancy(vacancyId, query);
      return paginatedResponse(c, result.items, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    },

    async getApplication(c: Context) {
      const { id: vacancyId, applicationId } =
        (c.get("validatedParams") as VacancyApplicationIdParams | undefined) ??
        vacancyApplicationIdParamSchema.parse(c.req.param());

      const application = await service.getApplicationById(
        vacancyId,
        applicationId,
      );
      return successResponse(c, application);
    },

    async updateApplication(c: Context) {
      const { id: vacancyId, applicationId } =
        (c.get("validatedParams") as VacancyApplicationIdParams | undefined) ??
        vacancyApplicationIdParamSchema.parse(c.req.param());

      const body =
        (c.get("validatedBody") as unknown | undefined) ?? (await c.req.json());
      const data = updateVacancyApplicationSchema.parse(body);

      const updated = await service.updateApplication(
        vacancyId,
        applicationId,
        data,
      );
      return successResponse(c, updated);
    },

    async deleteApplication(c: Context) {
      const { id: vacancyId, applicationId } =
        (c.get("validatedParams") as VacancyApplicationIdParams | undefined) ??
        vacancyApplicationIdParamSchema.parse(c.req.param());

      const result = await service.deleteApplication(vacancyId, applicationId);
      return successResponse(c, result);
    },
  };
};

export type VacancyController = ReturnType<typeof createVacancyController>;
