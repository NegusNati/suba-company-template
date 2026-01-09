import { relations } from "drizzle-orm";

import { user } from "./auth";
import { blogs, blogTags } from "./blogs";
import { caseStudies, caseStudyImages, caseStudyTags } from "./case-studies";
import { contacts } from "./contacts";
import { partners, testimonials } from "./partners";
import { products, productImages, productTags } from "./products";
import { services, serviceImages, serviceTags } from "./services";
import { socials, userSocials } from "./socials";
import { tags } from "./tags";
import { userProfiles } from "./users";
import { vacancies, vacancyApplications, vacancyTags } from "./vacancies";

export const userProfilesRelations = relations(
  userProfiles,
  ({ one, many }) => ({
    user: one(user, {
      fields: [userProfiles.userId],
      references: [user.id],
    }),
    socials: many(userSocials),
    blogs: many(blogs),
  }),
);

export const blogsRelations = relations(blogs, ({ one, many }) => ({
  author: one(user, {
    fields: [blogs.authorId],
    references: [user.id],
  }),
  tags: many(blogTags),
}));

export const blogTagsRelations = relations(blogTags, ({ one }) => ({
  blog: one(blogs, {
    fields: [blogTags.blogId],
    references: [blogs.id],
  }),
  tag: one(tags, {
    fields: [blogTags.tagId],
    references: [tags.id],
  }),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  images: many(serviceImages),
  tags: many(serviceTags),
  caseStudies: many(caseStudies),
  contacts: many(contacts),
}));

export const serviceImagesRelations = relations(serviceImages, ({ one }) => ({
  service: one(services, {
    fields: [serviceImages.serviceId],
    references: [services.id],
  }),
}));

export const serviceTagsRelations = relations(serviceTags, ({ one }) => ({
  service: one(services, {
    fields: [serviceTags.serviceId],
    references: [services.id],
  }),
  tag: one(tags, {
    fields: [serviceTags.tagId],
    references: [tags.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  service: one(services, {
    fields: [contacts.serviceId],
    references: [services.id],
  }),
}));

export const partnersRelations = relations(partners, ({ many }) => ({
  testimonials: many(testimonials),
  caseStudies: many(caseStudies),
}));

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  partner: one(partners, {
    fields: [testimonials.partnerId],
    references: [partners.id],
  }),
}));

export const caseStudiesRelations = relations(caseStudies, ({ many, one }) => ({
  images: many(caseStudyImages),
  tags: many(caseStudyTags),
  partner: one(partners, {
    fields: [caseStudies.clientId],
    references: [partners.id],
  }),
  service: one(services, {
    fields: [caseStudies.serviceId],
    references: [services.id],
  }),
}));

export const caseStudyImagesRelations = relations(
  caseStudyImages,
  ({ one }) => ({
    caseStudy: one(caseStudies, {
      fields: [caseStudyImages.caseStudyId],
      references: [caseStudies.id],
    }),
  }),
);

export const caseStudyTagsRelations = relations(caseStudyTags, ({ one }) => ({
  caseStudy: one(caseStudies, {
    fields: [caseStudyTags.caseStudyId],
    references: [caseStudies.id],
  }),
  tag: one(tags, {
    fields: [caseStudyTags.tagId],
    references: [tags.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  images: many(productImages),
  tags: many(productTags),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products, {
    fields: [productTags.productId],
    references: [products.id],
  }),
  tag: one(tags, {
    fields: [productTags.tagId],
    references: [tags.id],
  }),
}));

export const socialsRelations = relations(socials, ({ many }) => ({
  users: many(userSocials),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  blogs: many(blogTags),
  products: many(productTags),
  caseStudies: many(caseStudyTags),
  services: many(serviceTags),
  vacancies: many(vacancyTags),
}));

export const vacanciesRelations = relations(vacancies, ({ many, one }) => ({
  tags: many(vacancyTags),
  applications: many(vacancyApplications),
  createdBy: one(user, {
    fields: [vacancies.createdByUserId],
    references: [user.id],
  }),
}));

export const vacancyTagsRelations = relations(vacancyTags, ({ one }) => ({
  vacancy: one(vacancies, {
    fields: [vacancyTags.vacancyId],
    references: [vacancies.id],
  }),
  tag: one(tags, {
    fields: [vacancyTags.tagId],
    references: [tags.id],
  }),
}));

export const vacancyApplicationsRelations = relations(
  vacancyApplications,
  ({ one }) => ({
    vacancy: one(vacancies, {
      fields: [vacancyApplications.vacancyId],
      references: [vacancies.id],
    }),
  }),
);
