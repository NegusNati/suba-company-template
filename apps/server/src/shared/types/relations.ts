import { z } from "zod";

// Author DTO - represents a user in author context
export const authorDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  image: z.string().nullable(),
  socials: z
    .array(
      z.object({
        id: z.number(),
        handle: z.string().nullable(),
        fullUrl: z.string().nullable(),
        title: z.string(),
        iconUrl: z.string().nullable(),
        baseUrl: z.string(),
      }),
    )
    .default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AuthorDto = z.infer<typeof authorDtoSchema>;

// Service summary DTO
export const serviceSummaryDtoSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
});

export type ServiceSummaryDto = z.infer<typeof serviceSummaryDtoSchema>;

// Partner summary DTO
export const partnerSummaryDtoSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  websiteUrl: z.string().nullable().optional(),
});

export type PartnerSummaryDto = z.infer<typeof partnerSummaryDtoSchema>;

// Tag DTO
export const tagDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export type TagDto = z.infer<typeof tagDtoSchema>;

// Image DTO
export const imageDtoSchema = z.object({
  id: z.number(),
  imageUrl: z.string(),
  caption: z.string().nullable().optional(),
  position: z.number().optional(),
});

export type ImageDto = z.infer<typeof imageDtoSchema>;

// Manager DTO for org hierarchy
export const managerDtoSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  title: z.string(),
});

export type ManagerDto = z.infer<typeof managerDtoSchema>;
