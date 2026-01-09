import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import { getTableName } from "drizzle-orm";

import { db } from "../index";
import { eq, inArray, sql, type InferInsertModel, type PgColumn } from "../orm";
import {
  blogTags,
  blogs,
  caseStudies,
  caseStudyImages,
  caseStudyTags,
  companyMembers,
  contacts,
  faqs,
  galleryItems,
  partners,
  productImages,
  productTags,
  products,
  serviceImages,
  services,
  socials,
  tags,
  testimonials,
  user,
  userProfiles,
  userSocials,
  vacancies,
  vacancyApplications,
  vacancyTags,
} from "../schema";
import {
  blogContentSeeds,
  caseStudyContentSeeds,
  companyMemberSeeds,
  contactSeeds,
  faqSeeds,
  gallerySeeds,
  partnerSeeds,
  productContentSeeds,
  serviceContentSeeds,
  socialSeeds,
  tagSeeds,
  testimonialSeeds,
  userProfileSeeds,
  userSeeds,
  userSocialHandleSeeds,
  vacancyApplicationSeeds,
  vacancySeeds,
} from "./data";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../../..");

// Load env from root .env file
config({ path: path.join(root, ".env") });

const args = new Set(process.argv.slice(2));
const fresh = args.has("--fresh") || !args.has("--append");
const dryRun = args.has("--dry-run");

const log = (...msg: unknown[]) => {
  if (!process.env.SEED_SILENT) return;
  // eslint-disable-next-line no-console
  console.log("[seed]", ...msg);
};
const warn = (...msg: unknown[]) => {
  if (!process.env.SEED_SILENT) return;
  // eslint-disable-next-line no-console
  console.warn("[seed]", ...msg);
};

const GUARDED =
  process.env.NODE_ENV === "production" && process.env.ALLOW_SEED !== "true";

if (GUARDED) {
  throw new Error(
    "Seeding blocked in production. Set ALLOW_SEED=true to override (not recommended).",
  );
}

const truncateTables = async () => {
  if (!fresh) return;
  const tableList = [
    "blog_tags",
    "blogs",
    "case_study_tags",
    "case_study_images",
    "case_studies",
    "service_images",
    "services",
    "testimonials",
    "partners",
    "product_tags",
    "product_images",
    "products",
    "vacancy_tags",
    "vacancy_applications",
    "vacancies",
    "contacts",
    "gallery_items",
    "faqs",
    "user_socials",
    "socials",
    "company_members",
    "user_profiles",
    "session",
    "account",
    "verification",
    "user",
    "tags",
  ];
  const query = sql.raw(
    `TRUNCATE TABLE ${tableList.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE;`,
  );
  if (dryRun) {
    log("DRY RUN: would truncate tables");
    return;
  }
  await db.execute(query);
  log("Truncated tables (restart identity, cascade).");
};

type MapBySlug = Record<string, number>;

async function insertMany(
  table: object,
  rows: Array<Record<string, unknown>>,
  opts?: { conflictTarget?: PgColumn | PgColumn[] },
) {
  if (!rows.length) return;
  const tname = getTableName(table as never);
  if (dryRun) return;
  const query = db
    .insert(table as never)
    .values(rows as never)
    .onConflictDoNothing(
      opts?.conflictTarget ? { target: opts.conflictTarget } : undefined,
    );
  await query;
  log(`Inserted ${rows.length} rows into ${tname}`);
}

async function selectSlugMap(
  table: object,
  slugCol: PgColumn,
  idCol: PgColumn,
): Promise<MapBySlug> {
  const rows = await db
    .select({ slug: slugCol, id: idCol })
    .from(table as never);
  return Object.fromEntries(rows.map((r) => [r.slug, Number(r.id)]));
}

async function selectTitleMap(
  table: object,
  titleCol: PgColumn,
  idCol: PgColumn,
): Promise<MapBySlug> {
  const rows = await db
    .select({ title: titleCol, id: idCol })
    .from(table as never);
  return Object.fromEntries(rows.map((r) => [r.title, Number(r.id)]));
}

async function run() {
  const start = Date.now();
  log(
    `Starting seed with mode=${fresh ? "fresh" : "append"} dryRun=${
      dryRun ? "yes" : "no"
    }`,
  );

  if (!process.env.DATABASE_URL) {
    warn(
      "DATABASE_URL not set; falling back to default from packages/db/src/index.ts",
    );
  }

  await truncateTables();

  // Tags
  await insertMany(tags, tagSeeds, { conflictTarget: tags.slug });
  const tagMap = await selectSlugMap(tags, tags.slug, tags.id);

  // Services + images
  await insertMany(services, serviceContentSeeds, {
    conflictTarget: services.slug,
  });
  const serviceMap = await selectSlugMap(services, services.slug, services.id);

  const serviceImageRows: InferInsertModel<typeof serviceImages>[] = [];
  for (const svc of serviceContentSeeds) {
    const serviceId = serviceMap[svc.slug];
    if (!serviceId) continue;
    svc.images.forEach((img, idx) => {
      serviceImageRows.push({
        serviceId,
        imageUrl: img.url,
        position: img.position ?? idx,
      });
    });
  }
  await insertMany(serviceImages, serviceImageRows, {
    conflictTarget: [serviceImages.serviceId, serviceImages.position],
  });

  // Partners + testimonials
  await insertMany(partners, partnerSeeds, { conflictTarget: partners.slug });
  const partnerMap = await selectSlugMap(partners, partners.slug, partners.id);

  const testimonialRows: Array<InferInsertModel<typeof testimonials>> =
    testimonialSeeds
      .map((t) => {
        const partnerId = partnerMap[t.partnerSlug];
        if (!partnerId) return null;
        const { partnerSlug: _partnerSlug, ...rest } = t;
        return { ...rest, partnerId };
      })
      .filter(Boolean) as Array<InferInsertModel<typeof testimonials>>;
  await insertMany(testimonials, testimonialRows);

  // Socials
  await insertMany(socials, socialSeeds, { conflictTarget: socials.title });
  const socialMap = await selectTitleMap(socials, socials.title, socials.id);

  // Users + profiles
  await insertMany(user, userSeeds, { conflictTarget: user.id });
  const profileUserIds = userProfileSeeds.map((p) => p.userId);
  if (!dryRun && profileUserIds.length) {
    await db
      .delete(userProfiles)
      .where(inArray(userProfiles.userId, profileUserIds));
  }
  await insertMany(userProfiles, userProfileSeeds);
  const profileRows = await db
    .select({ id: userProfiles.id, userId: userProfiles.userId })
    .from(userProfiles);
  const profileMap: Record<string, number> = Object.fromEntries(
    profileRows.map((r) => [r.userId, Number(r.id)]),
  );

  // User socials
  const userSocialRows: InferInsertModel<typeof userSocials>[] = [];
  for (const entry of userSocialHandleSeeds) {
    const profileId = profileMap[entry.userId];
    const socialId = socialMap[entry.socialTitle];
    if (!profileId || !socialId) continue;
    userSocialRows.push({
      profileId,
      socialId,
      handle: entry.handle,
      fullUrl: entry.fullUrl,
    });
  }
  await insertMany(userSocials, userSocialRows);

  // Vacancies + tags
  await insertMany(
    vacancies,
    vacancySeeds.map(({ tagSlugs: _tagSlugs, ...row }) => row),
    { conflictTarget: vacancies.slug },
  );
  const vacancyMap = await selectSlugMap(
    vacancies,
    vacancies.slug,
    vacancies.id,
  );

  const vacancyTagRows: Array<InferInsertModel<typeof vacancyTags>> = [];
  for (const vacancy of vacancySeeds) {
    const vacancyId = vacancyMap[vacancy.slug];
    if (!vacancyId) continue;
    vacancy.tagSlugs.forEach((slug) => {
      const tagId = tagMap[slug];
      if (tagId) vacancyTagRows.push({ vacancyId, tagId });
    });
  }
  await insertMany(vacancyTags, vacancyTagRows, {
    conflictTarget: [vacancyTags.vacancyId, vacancyTags.tagId],
  });

  // Vacancy applications
  const vacancyApplicationRows: Array<
    InferInsertModel<typeof vacancyApplications>
  > = vacancyApplicationSeeds
    .map((entry) => {
      const vacancyId = vacancyMap[entry.vacancySlug];
      if (!vacancyId) return null;
      const { vacancySlug: _vacancySlug, ...rest } = entry;
      return { ...rest, vacancyId };
    })
    .filter(Boolean) as Array<InferInsertModel<typeof vacancyApplications>>;
  await insertMany(vacancyApplications, vacancyApplicationRows);

  // Products + images + tags
  await insertMany(products, productContentSeeds, {
    conflictTarget: products.slug,
  });
  const productMap = await selectSlugMap(products, products.slug, products.id);

  const productImageRows: Array<InferInsertModel<typeof productImages>> = [];
  const productTagRows: Array<InferInsertModel<typeof productTags>> = [];
  for (const prod of productContentSeeds) {
    const productId = productMap[prod.slug];
    if (!productId) continue;
    prod.images.forEach((img, idx) => {
      productImageRows.push({
        productId,
        imageUrl: img.url,
        position: img.position ?? idx,
      });
    });
    prod.tagSlugs.forEach((slug) => {
      const tagId = tagMap[slug];
      if (tagId) productTagRows.push({ productId, tagId });
    });
  }
  await insertMany(productImages, productImageRows, {
    conflictTarget: [productImages.productId, productImages.position],
  });
  await insertMany(productTags, productTagRows);

  // Case studies + images + tags
  await insertMany(
    caseStudies,
    caseStudyContentSeeds.map(({ clientSlug, serviceSlug, ...cs }) => {
      const clientId = clientSlug ? (partnerMap[clientSlug] ?? null) : null;
      const serviceId = serviceSlug ? (serviceMap[serviceSlug] ?? null) : null;
      return { ...cs, clientId, serviceId };
    }),
    { conflictTarget: caseStudies.slug },
  );
  const caseStudyMap = await selectSlugMap(
    caseStudies,
    caseStudies.slug,
    caseStudies.id,
  );

  const caseStudyImageRows: Array<InferInsertModel<typeof caseStudyImages>> =
    [];
  const caseStudyTagRows: Array<InferInsertModel<typeof caseStudyTags>> = [];
  for (const cs of caseStudyContentSeeds) {
    const caseStudyId = caseStudyMap[cs.slug];
    if (!caseStudyId) continue;
    cs.imageUrls.forEach((img, idx) =>
      caseStudyImageRows.push({
        caseStudyId,
        imageUrl: img.url,
        caption: img.caption,
        position: img.position ?? idx,
      }),
    );
    cs.tagSlugs.forEach((slug) => {
      const tagId = tagMap[slug];
      if (tagId) caseStudyTagRows.push({ caseStudyId, tagId });
    });
  }
  await insertMany(caseStudyImages, caseStudyImageRows);
  await insertMany(caseStudyTags, caseStudyTagRows);

  // Blogs + blog tags
  await insertMany(blogs, blogContentSeeds, { conflictTarget: blogs.slug });
  const blogRows = await db
    .select({ id: blogs.id, slug: blogs.slug })
    .from(blogs);
  const blogMap = Object.fromEntries(
    blogRows.map((r) => [r.slug, Number(r.id)]),
  );
  const blogTagRows: Array<InferInsertModel<typeof blogTags>> = [];
  for (const blog of blogContentSeeds) {
    const blogId = blogMap[blog.slug];
    if (!blogId) continue;
    blog.tagSlugs.forEach((slug) => {
      const tagId = tagMap[slug];
      if (tagId) blogTagRows.push({ blogId, tagId });
    });
  }
  await insertMany(blogTags, blogTagRows);

  // FAQs
  await insertMany(faqs, faqSeeds);

  // Gallery
  await insertMany(galleryItems, gallerySeeds);

  // Contacts (assign service by slug when available)
  const contactRows: InferInsertModel<typeof contacts>[] = contactSeeds.map(
    (c) => {
      const { serviceSlug, ...rest } = c as typeof c & {
        serviceSlug?: string;
      };
      const serviceId = serviceSlug ? (serviceMap[serviceSlug] ?? null) : null;
      return { ...rest, serviceId };
    },
  );
  await insertMany(contacts, contactRows);

  // Company members (manager relationships mapped after insert)
  await insertMany(companyMembers, companyMemberSeeds);
  const members = await db
    .select({
      id: companyMembers.id,
      firstName: companyMembers.firstName,
      lastName: companyMembers.lastName,
    })
    .from(companyMembers);
  const memberMap: Record<string, number> = Object.fromEntries(
    members.map((m) => [`${m.firstName} ${m.lastName}`, Number(m.id)]),
  );
  const relationships: Record<string, string> = {
    "Hanna Tesfaye": "Nati Negus",
    "Biruk Kebede": "Nati Negus",
    "Rahel Abebe": "Nati Negus",
    "Khalid Yimer": "Biruk Kebede",
  };
  for (const [child, manager] of Object.entries(relationships)) {
    const childId = memberMap[child];
    const managerId = memberMap[manager];
    if (!childId || !managerId) continue;
    if (dryRun) {
      log(`DRY RUN: would set manager for ${child} -> ${manager}`);
      continue;
    }
    await db
      .update(companyMembers)
      .set({ managerId })
      .where(eq(companyMembers.id, childId));
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  if (!process.env.SEED_SILENT) {
    // eslint-disable-next-line no-console
    console.log("[seed]", `Seed completed in ${duration}s`);
  }
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[seed] failed:", err);
  process.exit(1);
});
