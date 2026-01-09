import type { OrgRepository } from "./repository";
import { mapOrgMemberResponse } from "./schema";
import type {
  CreateOrgMemberInput,
  UpdateOrgMemberInput,
  OrgQuery,
  PublicOrgQuery,
} from "./validators";
import { NotFoundError, ValidationError } from "../../core/http";

export const createOrgService = (repository: OrgRepository) => {
  const detectCycle = async (
    memberId: number,
    proposedManagerId: number,
  ): Promise<boolean> => {
    if (memberId === proposedManagerId) {
      return true;
    }

    const allMembers = await repository.findAllFlat();
    const memberMap = new Map(allMembers.map((m) => [m.id, m]));

    let currentId: number | null = proposedManagerId;
    const visited = new Set<number>();

    while (currentId !== null) {
      if (visited.has(currentId)) {
        return false;
      }
      if (currentId === memberId) {
        return true;
      }

      visited.add(currentId);
      const current = memberMap.get(currentId);
      currentId = current?.managerId ?? null;
    }

    return false;
  };

  return {
    async getOrgMembers(query: OrgQuery) {
      const result = await repository.findAll(query);

      return {
        ...result,
        items: result.items.map((member) =>
          mapOrgMemberResponse(
            member as {
              id: number;
              firstName: string;
              lastName: string;
              title: string;
              headshotUrl?: string | null;
              managerId: number | null;
              createdAt: string;
              updatedAt: string;
            },
          ),
        ),
      };
    },

    async getOrgMember(id: number) {
      const member = await repository.findById(id);
      if (!member) {
        throw new NotFoundError(`Org member with id ${id} not found`);
      }
      return mapOrgMemberResponse(
        member as {
          id: number;
          firstName: string;
          lastName: string;
          title: string;
          headshotUrl?: string | null;
          managerId: number | null;
          createdAt: string;
          updatedAt: string;
        },
      );
    },

    async createOrgMember(data: CreateOrgMemberInput) {
      if (data.managerId) {
        const manager = await repository.findById(data.managerId);
        if (!manager) {
          throw new ValidationError(
            `Manager with id ${data.managerId} does not exist`,
          );
        }
      }

      return await repository.create(data);
    },

    async updateOrgMember(id: number, data: UpdateOrgMemberInput) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Org member with id ${id} not found`);
      }

      if (data.managerId !== undefined) {
        if (data.managerId !== null) {
          const manager = await repository.findById(data.managerId);
          if (!manager) {
            throw new ValidationError(
              `Manager with id ${data.managerId} does not exist`,
            );
          }

          const hasCycle = await detectCycle(id, data.managerId);
          if (hasCycle) {
            throw new ValidationError(
              "Cannot set manager: would create a reporting cycle",
            );
          }
        }
      }

      return await repository.update(id, data);
    },

    async deleteOrgMember(id: number) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Org member with id ${id} not found`);
      }

      const directReports = await repository.findDirectReports(id);

      for (const report of directReports) {
        await repository.updateManagerId(report.id, existing.managerId);
      }

      await repository.delete(id);
      return { message: "Member deleted successfully" };
    },

    async getPublicOrg(query: PublicOrgQuery) {
      return await repository.findPublic(query);
    },
  };
};

export type OrgService = ReturnType<typeof createOrgService>;
