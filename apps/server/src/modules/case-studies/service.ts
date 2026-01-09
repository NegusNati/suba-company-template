import type { CaseStudyRepository } from "./repository";
import type {
  CreateCaseStudyInput,
  UpdateCaseStudyInput,
  CaseStudyQuery,
  PublicCaseStudyQuery,
} from "./validators";
import { NotFoundError, ConflictError } from "../../core/http";
import { generateSlug, ensureUniqueSlug } from "../../shared/utils/slug";

export const createCaseStudyService = (repository: CaseStudyRepository) => {
  return {
    async getCaseStudies(query: CaseStudyQuery) {
      return await repository.findAll(query);
    },

    async getCaseStudyById(id: number, includeRelations = false) {
      const caseStudy = includeRelations
        ? await repository.findWithRelations(id)
        : await repository.findById(id);

      if (!caseStudy) {
        throw new NotFoundError(`Case study with id ${id} not found`);
      }

      return caseStudy;
    },

    async createCaseStudy(data: CreateCaseStudyInput) {
      try {
        return await repository.create(data);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          if (error.message.includes("slug")) {
            throw new ConflictError(
              `Case study with slug "${data.slug}" already exists`,
            );
          }
          throw new ConflictError("Case study with this slug already exists");
        }
        throw error;
      }
    },

    async updateCaseStudy(id: number, data: UpdateCaseStudyInput) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Case study with id ${id} not found`);
      }

      const enrichedData: UpdateCaseStudyInput & { slug?: string } = {
        ...data,
      };

      // Regenerate slug only if title changed
      if (data.title && data.title !== existing.title) {
        enrichedData.slug = await ensureUniqueSlug(
          generateSlug(data.title),
          async (s) => {
            const found = await repository.findBySlug(s);
            return !!found && found.id !== id;
          },
        );
      }

      try {
        return await repository.update(id, enrichedData);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          throw new ConflictError("Case study with this slug already exists");
        }
        throw error;
      }
    },

    async deleteCaseStudy(id: number) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Case study with id ${id} not found`);
      }

      return await repository.delete(id);
    },

    async getPublicCaseStudies(query: PublicCaseStudyQuery) {
      const clampedQuery = {
        ...query,
        limit: Math.min(query.limit, 50),
      };
      return await repository.findPublicList(clampedQuery);
    },

    async getPublicCaseStudyBySlug(slug: string) {
      const caseStudy = await repository.findBySlugWithRelations(slug);
      if (!caseStudy) {
        throw new NotFoundError(`Case study with slug "${slug}" not found`);
      }
      return caseStudy;
    },
  };
};

export type CaseStudyService = ReturnType<typeof createCaseStudyService>;
