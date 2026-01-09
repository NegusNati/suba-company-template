import { z } from "zod";

export const testimonialSchema = z.object({
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

export type Testimonial = z.infer<typeof testimonialSchema>;
