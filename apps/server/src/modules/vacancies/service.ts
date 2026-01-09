import type { VacancyRepository } from "./repository";
import type {
  CreateVacancyApplicationInput,
  CreateVacancyInput,
  PublicVacancyQuery,
  UpdateVacancyApplicationInput,
  UpdateVacancyInput,
  VacancyApplicationQuery,
  VacancyQuery,
} from "./validators";
import { BadRequestError, NotFoundError } from "../../core/http";
import { ensureUniqueSlug, generateSlug } from "../../shared/utils/slug";

const isExpired = (deadlineAt?: string | null) => {
  if (!deadlineAt) return false;
  const deadline = new Date(deadlineAt);
  if (Number.isNaN(deadline.getTime())) return false;
  return deadline.getTime() <= Date.now();
};

const validateSalaryRange = (
  salaryMin?: number | null,
  salaryMax?: number | null,
) => {
  const min = salaryMin ?? undefined;
  const max = salaryMax ?? undefined;

  if (min !== undefined && max !== undefined && min > max) {
    throw new BadRequestError(
      "salaryMin must be less than or equal to salaryMax",
    );
  }
};

const normalizeIso = (iso?: string | null) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

export const createVacancyService = (repository: VacancyRepository) => {
  return {
    async getVacancies(query: VacancyQuery) {
      return await repository.findAll(query);
    },

    async getVacancyById(id: number) {
      const vacancy = await repository.findById(id);
      if (!vacancy) {
        throw new NotFoundError(`Vacancy with id ${id} not found`);
      }
      return vacancy;
    },

    async getVacancyBySlug(slug: string) {
      const vacancy = await repository.findBySlug(slug);
      if (!vacancy) {
        throw new NotFoundError(`Vacancy with slug "${slug}" not found`);
      }
      return vacancy;
    },

    async createVacancy(createdByUserId: string, data: CreateVacancyInput) {
      validateSalaryRange(data.salaryMin, data.salaryMax);

      const baseSlug = data.slug ?? generateSlug(data.title);
      const slug = await ensureUniqueSlug(baseSlug, async (s) => {
        const existing = await repository.findBySlug(s);
        return !!existing;
      });

      const status = data.status ?? "DRAFT";
      const publishedAt =
        status === "PUBLISHED" || status === "CLOSED"
          ? (data.publishedAt ?? new Date().toISOString())
          : null;

      if (
        status === "PUBLISHED" &&
        data.deadlineAt &&
        isExpired(data.deadlineAt)
      ) {
        throw new BadRequestError(
          "deadlineAt must be in the future when publishing a vacancy",
        );
      }

      return await repository.create({
        ...data,
        slug,
        status,
        publishedAt,
        createdByUserId,
      });
    },

    async updateVacancy(id: number, data: UpdateVacancyInput) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Vacancy with id ${id} not found`);
      }

      const mergedSalaryMin =
        data.salaryMin !== undefined ? data.salaryMin : existing.salaryMin;
      const mergedSalaryMax =
        data.salaryMax !== undefined ? data.salaryMax : existing.salaryMax;
      validateSalaryRange(mergedSalaryMin, mergedSalaryMax);

      const enrichedData: Omit<
        UpdateVacancyInput,
        "publishedAt" | "deadlineAt"
      > & {
        slug?: string;
        publishedAt?: string | null;
        deadlineAt?: string | null;
      } = { ...data };

      if (data.title && data.title !== existing.title) {
        enrichedData.slug = await ensureUniqueSlug(
          generateSlug(data.title),
          async (s) => {
            const found = await repository.findBySlug(s);
            return !!found && found.id !== id;
          },
        );
      }

      if (data.status) {
        if (data.status === "PUBLISHED") {
          const effectiveDeadline = data.deadlineAt ?? existing.deadlineAt;
          if (effectiveDeadline && isExpired(effectiveDeadline)) {
            throw new BadRequestError(
              "deadlineAt must be in the future when publishing a vacancy",
            );
          }

          if (!existing.publishedAt && !data.publishedAt) {
            enrichedData.publishedAt = new Date().toISOString();
          }
        }

        if (data.status === "DRAFT") {
          enrichedData.publishedAt = null;
        }
      }

      if (data.publishedAt) {
        enrichedData.publishedAt = normalizeIso(data.publishedAt);
      }

      const updated = await repository.update(id, enrichedData);
      if (!updated) {
        throw new NotFoundError(`Vacancy with id ${id} not found`);
      }
      return updated;
    },

    async deleteVacancy(id: number) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Vacancy with id ${id} not found`);
      }

      await repository.delete(id);
      return { message: "Vacancy deleted successfully" };
    },

    async getPublicVacancies(query: PublicVacancyQuery) {
      const result = await repository.findPublic(query);
      const items = result.items.map((vacancy) => {
        const expired = isExpired(vacancy.deadlineAt);
        const canApply = vacancy.status === "PUBLISHED" && !expired;
        return { ...vacancy, isExpired: expired, canApply };
      });

      return { ...result, items };
    },

    async getPublicVacancyBySlug(slug: string) {
      const vacancy = await repository.findPublicBySlug(slug);
      if (!vacancy) {
        throw new NotFoundError(`Vacancy with slug "${slug}" not found`);
      }

      const expired = isExpired(vacancy.deadlineAt);
      const canApply = vacancy.status === "PUBLISHED" && !expired;
      return { ...vacancy, isExpired: expired, canApply };
    },

    async getPublicVacancyById(id: number) {
      const vacancy = await repository.findPublicById(id);
      if (!vacancy) {
        throw new NotFoundError(`Vacancy with id ${id} not found`);
      }

      const expired = isExpired(vacancy.deadlineAt);
      const canApply = vacancy.status === "PUBLISHED" && !expired;
      return { ...vacancy, isExpired: expired, canApply };
    },

    async submitApplication(
      vacancyId: number,
      data: CreateVacancyApplicationInput,
    ) {
      const vacancy = await repository.findById(vacancyId);
      if (!vacancy) {
        throw new NotFoundError(`Vacancy with id ${vacancyId} not found`);
      }

      const publishedAtOk = vacancy.publishedAt
        ? new Date(vacancy.publishedAt).getTime() <= Date.now()
        : false;

      const closedByStatus = vacancy.status !== "PUBLISHED";
      const closedByDeadline = isExpired(vacancy.deadlineAt);

      if (!publishedAtOk || closedByStatus || closedByDeadline) {
        throw new BadRequestError("This vacancy is closed for applications");
      }

      return await repository.createApplication(vacancyId, data);
    },

    async getApplicationsForVacancy(
      vacancyId: number,
      query: VacancyApplicationQuery,
    ) {
      const vacancy = await repository.findById(vacancyId);
      if (!vacancy) {
        throw new NotFoundError(`Vacancy with id ${vacancyId} not found`);
      }

      return await repository.findApplicationsByVacancyId(vacancyId, query);
    },

    async getApplicationById(vacancyId: number, applicationId: number) {
      const application = await repository.findApplicationById(
        vacancyId,
        applicationId,
      );
      if (!application) {
        throw new NotFoundError(
          `Application ${applicationId} not found for vacancy ${vacancyId}`,
        );
      }
      return application;
    },

    async updateApplication(
      vacancyId: number,
      applicationId: number,
      data: UpdateVacancyApplicationInput,
    ) {
      const existing = await repository.findApplicationById(
        vacancyId,
        applicationId,
      );
      if (!existing) {
        throw new NotFoundError(
          `Application ${applicationId} not found for vacancy ${vacancyId}`,
        );
      }

      const shouldMarkReviewed =
        data.status !== undefined || data.notes !== undefined;
      const reviewedAt = shouldMarkReviewed
        ? new Date().toISOString()
        : undefined;

      const updated = await repository.updateApplication(
        vacancyId,
        applicationId,
        {
          ...data,
          ...(reviewedAt ? { reviewedAt } : {}),
        },
      );

      if (!updated) {
        throw new NotFoundError(
          `Application ${applicationId} not found for vacancy ${vacancyId}`,
        );
      }

      return updated;
    },

    async deleteApplication(vacancyId: number, applicationId: number) {
      const existing = await repository.findApplicationById(
        vacancyId,
        applicationId,
      );
      if (!existing) {
        throw new NotFoundError(
          `Application ${applicationId} not found for vacancy ${vacancyId}`,
        );
      }

      await repository.deleteApplication(vacancyId, applicationId);
      return { message: "Application deleted successfully" };
    },
  };
};

export type VacancyService = ReturnType<typeof createVacancyService>;
