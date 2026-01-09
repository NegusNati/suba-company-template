import { z } from "zod";

export const testimonialResponseSchema = z.object({
  id: z.number(),
  comment: z.string(),
  companyName: z.string(),
  companyLogoUrl: z.string().nullable(),
  spokePersonName: z.string().nullable(),
  spokePersonTitle: z.string().nullable(),
  spokePersonHeadshotUrl: z.string().nullable(),
  partnerId: z.number().nullable(),
  partner: z
    .object({
      id: z.number(),
      title: z.string(),
      slug: z.string(),
    })
    .nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const publicTestimonialResponseSchema = z.object({
  id: z.number(),
  comment: z.string(),
  companyName: z.string(),
  companyLogoUrl: z.string().nullable(),
  spokePersonName: z.string().nullable(),
  spokePersonTitle: z.string().nullable(),
  spokePersonHeadshotUrl: z.string().nullable(),
  partner: z
    .object({
      id: z.number(),
      title: z.string(),
      slug: z.string(),
    })
    .nullable(),
});

export type TestimonialResponse = z.infer<typeof testimonialResponseSchema>;
export type PublicTestimonialResponse = z.infer<
  typeof publicTestimonialResponseSchema
>;

export const mapToTestimonialResponse = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testimonial: any,
): TestimonialResponse => {
  return {
    id: testimonial.id,
    comment: testimonial.comment,
    companyName: testimonial.companyName,
    companyLogoUrl: testimonial.companyLogoUrl ?? null,
    spokePersonName: testimonial.spokePersonName ?? null,
    spokePersonTitle: testimonial.spokePersonTitle ?? null,
    spokePersonHeadshotUrl: testimonial.spokePersonHeadshotUrl ?? null,
    partnerId: testimonial.partnerId ?? null,
    partner: testimonial.partner
      ? {
          id: testimonial.partner.id,
          title: testimonial.partner.title,
          slug: testimonial.partner.slug,
        }
      : null,
    createdAt: testimonial.createdAt,
    updatedAt: testimonial.updatedAt,
  };
};

export const mapToPublicTestimonialResponse = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testimonial: any,
): PublicTestimonialResponse => {
  return {
    id: testimonial.id,
    comment: testimonial.comment,
    companyName: testimonial.companyName,
    companyLogoUrl: testimonial.companyLogoUrl ?? null,
    spokePersonName: testimonial.spokePersonName ?? null,
    spokePersonTitle: testimonial.spokePersonTitle ?? null,
    spokePersonHeadshotUrl: testimonial.spokePersonHeadshotUrl ?? null,
    partner: testimonial.partner
      ? {
          id: testimonial.partner.id,
          title: testimonial.partner.title,
          slug: testimonial.partner.slug,
        }
      : null,
  };
};
