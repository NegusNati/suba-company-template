import { z } from "zod";

export const orgMemberResponseSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  title: z.string(),
  headshotUrl: z.string().nullable(),
  managerId: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type OrgMemberResponse = z.infer<typeof orgMemberResponseSchema>;

export const mapOrgMemberResponse = (member: {
  id: number;
  firstName: string;
  lastName: string;
  title: string;
  headshotUrl?: string | null;
  managerId: number | null;
  createdAt: string;
  updatedAt: string;
}): OrgMemberResponse =>
  orgMemberResponseSchema.parse({
    ...member,
    headshotUrl: member.headshotUrl ?? null,
  });

export interface OrgTreeNode {
  id: number;
  firstName: string;
  lastName: string;
  title: string;
  headshotUrl: string | null;
  managerId: number | null;
  children: OrgTreeNode[];
}
