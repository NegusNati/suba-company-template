import { z } from "zod";

export const faqSchema = z.object({
  id: z.number(),
  question: z.string(),
  answer: z.string(),
});

export type Faq = z.infer<typeof faqSchema>;
