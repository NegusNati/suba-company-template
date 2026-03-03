import { type InferInsertModel } from "../orm";
import type {
  account,
  blogs,
  businessSectorGalleryImages,
  businessSectors,
  businessSectorServices,
  businessSectorStats,
  caseStudies,
  companyMembers,
  contacts,
  faqs,
  galleryCategories,
  galleryItems,
  partners,
  products,
  services,
  session,
  socials,
  tags,
  testimonials,
  user,
  userProfiles,
  vacancyApplications,
  vacancies,
} from "../schema";

type SeedBlog = InferInsertModel<typeof blogs> & { tagSlugs: string[] };
type SeedCaseStudy = InferInsertModel<typeof caseStudies> & {
  tagSlugs: string[];
  imageUrls: { url: string; caption?: string; position?: number }[];
  clientSlug?: string;
  serviceSlug?: string;
};
type SeedService = InferInsertModel<typeof services> & {
  images: { url: string; position?: number }[];
};
type SeedBusinessSector = InferInsertModel<typeof businessSectors> & {
  stats: Array<Omit<InferInsertModel<typeof businessSectorStats>, "sectorId">>;
  services: Array<
    Omit<InferInsertModel<typeof businessSectorServices>, "sectorId">
  >;
  gallery: Array<
    Omit<InferInsertModel<typeof businessSectorGalleryImages>, "sectorId">
  >;
};

type SeedTestimonial = InferInsertModel<typeof testimonials> & {
  partnerSlug: string;
};

type SeedContact = InferInsertModel<typeof contacts> & { serviceSlug?: string };
type SeedProduct = InferInsertModel<typeof products> & {
  images: { url: string; position?: number }[];
  tagSlugs: string[];
};
type SeedVacancy = InferInsertModel<typeof vacancies> & {
  tagSlugs: string[];
};
type SeedVacancyApplication = Omit<
  InferInsertModel<typeof vacancyApplications>,
  "vacancyId"
> & {
  vacancySlug: string;
};
type SeedGalleryItem = Omit<
  InferInsertModel<typeof galleryItems>,
  "categoryId" | "imageUrls"
> & {
  categorySlug?: string;
  imageUrls: string[];
};

const now = () => new Date();
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

export const tagSeeds: InferInsertModel<typeof tags>[] = [
  { name: "Branding", slug: "branding" },
  { name: "Web Development", slug: "web-development" },
  { name: "UI/UX", slug: "ui-ux" },
  { name: "Mobile", slug: "mobile" },
  { name: "Product Strategy", slug: "product-strategy" },
  { name: "Data Visualization", slug: "data-viz" },
];

export const serviceSeeds: SeedService[] = [
  {
    title: "Brand Identity Systems",
    slug: "brand-identity",
    excerpt:
      "Research-driven brand platforms with visual language, tone, and rollout kits.",
    description:
      "We craft complete identity systems, from strategy and naming through logo, typography, color, motion, and brand governance so every touchpoint is consistent.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
        position: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=1400&q=80",
        position: 1,
      },
    ],
  },
  {
    title: "Web Design & Development",
    slug: "web-design-development",
    excerpt:
      "High-performance marketing sites, portals, and dashboards built on modern stacks.",
    description:
      "From sitemap to shipped code, we pair UX research with component-driven builds to keep content fresh and measurable.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1523473827534-86c5f1fccd07?auto=format&fit=crop&w=1400&q=80",
        position: 0,
      },
      {
        url: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1400&q=80",
        position: 1,
      },
    ],
  },
  {
    title: "Product Strategy Sprints",
    slug: "product-strategy",
    excerpt:
      "Insight-to-MVP sprints that align stakeholders, scope, and delivery plans.",
    description:
      "We run structured discovery, prototyping, and validation loops to derisk roadmap bets and prioritize the highest-impact work.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80",
        position: 0,
      },
    ],
  },
  {
    title: "Mobile App Design",
    slug: "mobile-app-design",
    excerpt:
      "Cross-platform product design with thoughtful onboarding and retention loops.",
    description:
      "Native-feeling experiences that balance usability, accessibility, and the performance your growth metrics demand.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1400&q=80",
        position: 0,
      },
    ],
  },
];

export const businessSectorSeeds: SeedBusinessSector[] = [
  {
    title: "Hospitality & Tourism",
    slug: "hospitality-tourism",
    excerpt:
      "Destination-led hospitality products and operations services for premium guest experiences.",
    history:
      "<p>We started with boutique hospitality projects in Addis Ababa and scaled into multi-location tourism operations with technology-enabled workflows.</p>",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    phoneNumber: "+251-11-123-4567",
    emailAddress: "hospitality@suba.studio",
    address: "Bole Road, Addis Ababa, Ethiopia",
    facebookUrl: "https://facebook.com/subahospitality",
    instagramUrl: "https://instagram.com/subahospitality",
    linkedinUrl: "https://www.linkedin.com/company/suba-hospitality",
    publishDate: daysAgo(20),
    stats: [
      { statKey: "Projects Delivered", statValue: "48+", position: 0 },
      { statKey: "Partner Hotels", statValue: "17", position: 1 },
      { statKey: "Cities Served", statValue: "6", position: 2 },
    ],
    services: [
      {
        title: "Hotel Brand & Experience Design",
        description:
          "End-to-end brand systems and customer journey design for hospitality operators.",
        imageUrl:
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=80",
        position: 0,
      },
      {
        title: "Revenue-Focused Web Platforms",
        description:
          "Booking-optimized websites with analytics and conversion workflows.",
        imageUrl:
          "https://images.unsplash.com/photo-1468824357306-a439d58ccb1c?auto=format&fit=crop&w=1400&q=80",
        position: 1,
      },
    ],
    gallery: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=80",
        position: 0,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1576675784201-0e142b423952?auto=format&fit=crop&w=1400&q=80",
        position: 1,
      },
    ],
  },
  {
    title: "Digital Commerce",
    slug: "digital-commerce",
    excerpt:
      "Composable commerce systems, fulfillment workflows, and growth experimentation.",
    history:
      "<p>Our commerce team combines platform engineering with growth experimentation, helping brands move from manual operations to measurable digital channels.</p>",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1600&q=80",
    phoneNumber: "+251-11-765-4321",
    emailAddress: "commerce@suba.studio",
    address: "Kazanchis, Addis Ababa, Ethiopia",
    facebookUrl: "https://facebook.com/subacommerce",
    instagramUrl: "https://instagram.com/subacommerce",
    linkedinUrl: "https://www.linkedin.com/company/suba-commerce",
    publishDate: daysAgo(10),
    stats: [
      { statKey: "Transactions Processed", statValue: "120K+", position: 0 },
      { statKey: "Avg. Conversion Lift", statValue: "34%", position: 1 },
      { statKey: "Merchants", statValue: "80+", position: 2 },
    ],
    services: [
      {
        title: "Commerce Platform Builds",
        description:
          "Scalable storefront and back-office architecture tailored for local markets.",
        imageUrl:
          "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1400&q=80",
        position: 0,
      },
      {
        title: "Lifecycle Automation",
        description:
          "Marketing and retention automation that improves conversion and LTV.",
        imageUrl:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
        position: 1,
      },
    ],
    gallery: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
        position: 0,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
        position: 1,
      },
    ],
  },
  {
    title: "Industrial Solutions",
    slug: "industrial-solutions",
    excerpt:
      "Operational modernization for industrial teams through software and data systems.",
    history:
      "<p>We support industrial operators with process digitization, monitoring platforms, and field-ready interfaces that shorten response time and improve quality controls.</p>",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1600&q=80",
    phoneNumber: "+251-11-555-0101",
    emailAddress: "industry@suba.studio",
    address: "Lebu Industrial Zone, Addis Ababa, Ethiopia",
    facebookUrl: "https://facebook.com/subaindustry",
    instagramUrl: "https://instagram.com/subaindustry",
    linkedinUrl: "https://www.linkedin.com/company/suba-industry",
    publishDate: null,
    stats: [
      { statKey: "Plants Supported", statValue: "12", position: 0 },
      { statKey: "Downtime Reduction", statValue: "21%", position: 1 },
      { statKey: "Team Trainings", statValue: "40+", position: 2 },
    ],
    services: [
      {
        title: "Operations Dashboards",
        description:
          "Unified monitoring and reporting dashboards for production teams.",
        imageUrl:
          "https://images.unsplash.com/photo-1581090700227-1e8a15f664a2?auto=format&fit=crop&w=1400&q=80",
        position: 0,
      },
      {
        title: "Workflow Digitization",
        description:
          "Field workflows and approval pipelines with audit-ready records.",
        imageUrl:
          "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1400&q=80",
        position: 1,
      },
    ],
    gallery: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1581092919535-7146ff1a5907?auto=format&fit=crop&w=1400&q=80",
        position: 0,
      },
    ],
  },
];

export const partnerSeeds: InferInsertModel<typeof partners>[] = [
  {
    title: "Nile Agro",
    slug: "nile-agro",
    description:
      "Marketplace for smallholder farmers to reach regional buyers.",
    websiteUrl: "https://example.com/nile-agro",
    logoUrl: "https://dummyimage.com/160x80/628b35/ffffff&text=Nile+Agro",
  },
  {
    title: "Blue Horizon Fintech",
    slug: "blue-horizon-fintech",
    description: "SME-focused digital wallet and credit rails.",
    websiteUrl: "https://example.com/blue-horizon",
    logoUrl: "https://dummyimage.com/160x80/1f2937/ffffff&text=Blue+Horizon",
  },
  {
    title: "Aster Health",
    slug: "aster-health",
    description:
      "Remote care enablement for clinics and community health workers.",
    websiteUrl: "https://example.com/aster-health",
    logoUrl: "https://dummyimage.com/160x80/0f766e/ffffff&text=Aster+Health",
  },
];

export const testimonialSeeds: SeedTestimonial[] = [
  {
    comment:
      "Suba translated complex field workflows into a clean, fast marketplace that our vendors love using.",
    companyName: "Nile Agro",
    partnerSlug: "nile-agro",
    companyLogoUrl: "https://dummyimage.com/120x60/628b35/ffffff&text=Nile",
    spokePersonName: "Liya Bekele",
    spokePersonTitle: "COO",
    spokePersonHeadshotUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
  },
  {
    comment:
      "The strategy sprint saved us months. We launched with confidence and hit our activation targets in week one.",
    companyName: "Blue Horizon Fintech",
    partnerSlug: "blue-horizon-fintech",
    companyLogoUrl: "https://dummyimage.com/120x60/1f2937/ffffff&text=BH",
    spokePersonName: "Yohannes Alemu",
    spokePersonTitle: "Product Lead",
    spokePersonHeadshotUrl:
      "https://images.unsplash.com/photo-1502764613149-7f1d229e230f?auto=format&fit=crop&w=200&q=80",
  },
  {
    comment:
      "Suba delivered a mobile-first experience that our clinicians picked up instantly. Adoption skyrocketed.",
    companyName: "Aster Health",
    partnerSlug: "aster-health",
    companyLogoUrl: "https://dummyimage.com/120x60/0f766e/ffffff&text=Aster",
    spokePersonName: "Sara Abdella",
    spokePersonTitle: "Head of Operations",
    spokePersonHeadshotUrl:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80",
  },
];

export const productSeeds: SeedProduct[] = [
  {
    title: "Suba Design System Kit",
    slug: "suba-design-system-kit",
    description:
      "Foundational UI kit with tokens, components, and templates tuned for Suba.",
    overview:
      "Includes Figma styles, responsive layouts, form components, and motion presets for fast delivery.",
    productLink: "https://suba.design/system-kit",
    tagSlugs: ["ui-ux", "branding"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80",
        position: 0,
      },
    ],
  },
  {
    title: "Growth Analytics Dashboard",
    slug: "growth-analytics-dashboard",
    description: "Composable analytics views for product and marketing teams.",
    overview:
      "Prebuilt cohorts, funnels, and retention views with export-ready visuals.",
    productLink: "https://suba.design/analytics-kit",
    tagSlugs: ["data-viz", "web-development"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1400&q=80",
        position: 0,
      },
    ],
  },
  {
    title: "Customer Feedback Portal",
    slug: "customer-feedback-portal",
    description:
      "Self-serve feedback capture with triage and roadmap visibility.",
    overview:
      "Great for beta programs and feature prioritization across distributed teams.",
    productLink: "https://suba.design/feedback-portal",
    tagSlugs: ["product-strategy", "ui-ux"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1400&q=80",
        position: 0,
      },
    ],
  },
];

export const caseStudySeeds: SeedCaseStudy[] = [
  {
    title: "Scaling Farmer Marketplaces",
    slug: "farmer-marketplaces",
    excerpt: "Unified inventory, trust signals, and payouts for rural vendors.",
    overview:
      "A multi-tenant marketplace with offline-friendly flows, staged payouts, and dynamic pricing.",
    clientSlug: "nile-agro",
    serviceSlug: "web-design-development",
    projectScope: "Discovery, UX/UI, web app build, handoff",
    impact:
      "20% increase in seller onboarding and 12% lift in completed orders.",
    problem: "Fragmented workflows and low trust between buyers and sellers.",
    process: "Shadowed vendors, prototyped escrow UX, piloted in 2 regions.",
    deliverable: "Responsive web app + admin console",
    tagSlugs: ["web-development", "ui-ux"],
    imageUrls: [
      {
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
        caption: "Vendor inventory overview",
        position: 0,
      },
    ],
  },
  {
    title: "Digital Wallet for SMEs",
    slug: "sme-digital-wallet",
    excerpt:
      "Card issuing, payouts, and spend controls tailored for small teams.",
    overview:
      "A compliant wallet with onboarding, KYC, spend limits, and multi-role approvals.",
    clientSlug: "blue-horizon-fintech",
    serviceSlug: "product-strategy",
    projectScope: "Product strategy sprint, UX/UI, design system",
    impact: "Cut onboarding time by 35% and reduced support tickets for KYC.",
    problem: "Lengthy onboarding and unclear card controls.",
    process: "Journey mapping, prototype validation, design system rollout.",
    deliverable: "Hi-fi prototype + design kit",
    tagSlugs: ["product-strategy", "ui-ux"],
    imageUrls: [
      {
        url: "https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=1400&q=80",
        caption: "Approvals and spend guardrails",
        position: 0,
      },
    ],
  },
  {
    title: "Remote Care Platform",
    slug: "remote-care-platform",
    excerpt: "Mobile-first care coordination for clinics and field workers.",
    overview:
      "Scheduling, telehealth, and care pathways packaged in a lightweight app.",
    clientSlug: "aster-health",
    serviceSlug: "mobile-app-design",
    projectScope: "Mobile UX, design system, QA support",
    impact: "Clinic response times improved by 18% within first quarter.",
    problem: "Patients were stuck in phone trees and paper follow-ups.",
    process: "Field interviews, iterative prototypes, accessibility sweeps.",
    deliverable: "iOS/Android-ready design kit",
    tagSlugs: ["mobile", "ui-ux"],
    imageUrls: [
      {
        url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80",
        caption: "Care pathway overview",
        position: 0,
      },
    ],
  },
];

export const blogSeeds: SeedBlog[] = [
  {
    title: "Design Systems for Fast-Moving Teams",
    slug: "design-systems-for-fast-moving-teams",
    excerpt:
      "How to keep brand and product velocity aligned without slowing teams down.",
    content:
      "We unpack the minimum viable design system for startups, including token strategy, contribution models, and governance.",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1400&q=80",
    authorId: "suba-admin",
    publishDate: new Date("2025-01-12T10:00:00Z").toISOString(),
    readTimeMinutes: 6,
    tagSlugs: ["ui-ux", "branding"],
  },
  {
    title: "Shipping Web Apps with Confidence",
    slug: "shipping-web-apps-with-confidence",
    excerpt:
      "Release cadence, observability, and QA workflows that keep quality high.",
    content:
      "From preview environments to trace-based monitoring, here’s the stack we rely on for dependable launches.",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1400&q=80",
    authorId: "suba-editor",
    publishDate: new Date("2025-01-05T08:00:00Z").toISOString(),
    readTimeMinutes: 7,
    tagSlugs: ["web-development", "product-strategy"],
  },
  {
    title: "Better Handoffs between Design and Engineering",
    slug: "better-handoffs-between-design-and-engineering",
    excerpt: "Reduce churn by aligning components, states, and content early.",
    content:
      "We cover live working sessions, shared checklists, and zero-height specs that minimize rework.",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?auto=format&fit=crop&w=1400&q=80",
    authorId: "suba-admin",
    publishDate: new Date("2024-12-15T12:00:00Z").toISOString(),
    readTimeMinutes: 5,
    tagSlugs: ["ui-ux", "web-development"],
  },
  {
    title: "From Insight to Sprint Plan in 48 Hours",
    slug: "from-insight-to-sprint-plan-in-48-hours",
    excerpt:
      "Our playbook for turning research into prioritized delivery plans.",
    content:
      "Templates, rituals, and stakeholder maps that speed up decision making for product teams.",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
    authorId: "suba-editor",
    publishDate: new Date("2024-12-02T09:00:00Z").toISOString(),
    readTimeMinutes: 4,
    tagSlugs: ["product-strategy"],
  },
  {
    title: "Designing Mobile for Low-Bandwidth Environments",
    slug: "designing-mobile-for-low-bandwidth-environments",
    excerpt: "Patterns that keep experiences smooth when connectivity drops.",
    content:
      "We share caching approaches, offline-first UI cues, and progressive enhancement tips.",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1400&q=80",
    authorId: "suba-admin",
    publishDate: new Date("2024-11-20T14:00:00Z").toISOString(),
    readTimeMinutes: 6,
    tagSlugs: ["mobile", "ui-ux"],
  },
];

export const faqSeeds: InferInsertModel<typeof faqs>[] = [
  {
    question: "How do we kick off a project?",
    answer:
      "We start with a discovery call, align on goals, then run a short strategy sprint to lock scope, timeline, and success metrics.",
    isActive: true,
  },
  {
    question: "Do you offer development as well as design?",
    answer:
      "Yes. We design, build, and ship. Our core stack covers modern web and mobile frameworks with DevOps baked in.",
    isActive: true,
  },
  {
    question: "Can you work with our in-house team?",
    answer:
      "Absolutely. We pair with your designers, engineers, and PMs, and can embed in your standups and rituals.",
    isActive: true,
  },
  {
    question: "How do you handle handoff?",
    answer:
      "We deliver documented design systems, specs, and walkthroughs. For builds, we provide repos, pipelines, and monitoring setups.",
    isActive: true,
  },
  {
    question: "Do you support ongoing retainers?",
    answer:
      "Yes. We offer retainers for iteration, A/B testing, and roadmap support after launch.",
    isActive: true,
  },
  {
    question: "Where are you based?",
    answer:
      "We are distributed with a core team in Addis Ababa and remote collaborators.",
    isActive: true,
  },
  {
    question: "What tools do you use?",
    answer:
      "Figma for design, modern JS/TS frameworks for build, and observability tooling for quality (Sentry, PostHog, LogRocket).",
    isActive: true,
  },
  {
    question: "How do you price projects?",
    answer:
      "We scope fixed-price phases for clarity and can support time & materials for ongoing experiments.",
    isActive: true,
  },
];

export const galleryCategorySeeds: InferInsertModel<
  typeof galleryCategories
>[] = [
  {
    name: "Uncategorized",
    slug: "uncategorized",
    isSystem: true,
  },
  {
    name: "Events",
    slug: "events",
  },
  {
    name: "Team",
    slug: "team",
  },
  {
    name: "Behind The Scenes",
    slug: "behind-the-scenes",
  },
];

export const gallerySeeds: SeedGalleryItem[] = [
  {
    categorySlug: "events",
    title: "Design Sprint Wall",
    description: "Day 2 concept mapping with the client squad.",
    imageUrls: [
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80",
    ],
    occurredAt: new Date("2024-10-10T10:00:00Z").toISOString(),
  },
  {
    categorySlug: "team",
    title: "Component Library Review",
    description: "Audit of button, form, and navigation variants.",
    imageUrls: [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80",
    ],
    occurredAt: new Date("2024-11-05T10:00:00Z").toISOString(),
  },
  {
    categorySlug: "behind-the-scenes",
    title: "Mobile Handoff",
    description: "Engineers walking through motion specs.",
    imageUrls: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1400&q=80",
    ],
    occurredAt: new Date("2024-11-28T10:00:00Z").toISOString(),
  },
  {
    categorySlug: "events",
    title: "Client Roadmap Workshop",
    description: "Prioritizing experiments and releases for Q1.",
    imageUrls: [
      "https://images.unsplash.com/photo-1529333166433-1a6b0d67be04?auto=format&fit=crop&w=1400&q=80",
    ],
    occurredAt: new Date("2025-01-06T10:00:00Z").toISOString(),
  },
  {
    categorySlug: "events",
    title: "System Demo",
    description: "Showcase of analytics dashboards shipped in sprints.",
    imageUrls: [
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1400&q=80",
    ],
    occurredAt: new Date("2025-01-10T10:00:00Z").toISOString(),
  },
  {
    categorySlug: "team",
    title: "Team Retro",
    description: "End-of-sprint reflections and next steps.",
    imageUrls: [
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80",
    ],
    occurredAt: new Date("2025-01-15T10:00:00Z").toISOString(),
  },
];

export const contactSeeds: SeedContact[] = [
  {
    fullName: "Selam Mengistu",
    contact: "selam@acme.dev",
    message: "Looking for a brand refresh and web launch in Q2.",
    isHandled: false,
    serviceSlug: "brand-identity",
  },
  {
    fullName: "Jonas Mekonen",
    contact: "+251-90-123-4567",
    message: "Need mobile app UX review ahead of funding round.",
    isHandled: false,
    serviceSlug: "mobile-app-design",
  },
  {
    fullName: "Marta Abate",
    contact: "marta@example.com",
    message: "Seeking product strategy sprint for a fintech MVP.",
    isHandled: false,
    serviceSlug: "product-strategy",
  },
];

export const vacancySeeds: SeedVacancy[] = [
  {
    title: "Senior Product Designer",
    slug: "senior-product-designer",
    excerpt:
      "Lead end-to-end product design for multi-platform client experiences.",
    description:
      "<p>Own product discovery, interaction design, and visual systems for high-growth teams. You will partner with PMs and engineers to ship new features and iterate on core journeys.</p>",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
    department: "Design",
    location: "Remote",
    workplaceType: "REMOTE",
    employmentType: "FULL_TIME",
    seniority: "SENIOR",
    salaryMin: 80000,
    salaryMax: 120000,
    salaryCurrency: "USD",
    applyEmail: "careers@suba.studio",
    status: "PUBLISHED",
    publishedAt: daysAgo(15),
    deadlineAt: daysFromNow(30),
    createdByUserId: "suba-admin",
    tagSlugs: ["ui-ux", "product-strategy"],
  },
  {
    title: "Frontend Engineer",
    slug: "frontend-engineer",
    excerpt: "Build polished dashboards and marketing experiences in React.",
    description:
      "<p>Ship production-grade interfaces, collaborate on design systems, and improve frontend performance. Experience with Vite, React Query, and TypeScript is a plus.</p>",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1400&q=80",
    department: "Engineering",
    location: "Addis Ababa",
    workplaceType: "HYBRID",
    employmentType: "FULL_TIME",
    seniority: "MID",
    salaryMin: 65000,
    salaryMax: 95000,
    salaryCurrency: "USD",
    applyEmail: "engineering@suba.studio",
    status: "PUBLISHED",
    publishedAt: daysAgo(5),
    deadlineAt: daysFromNow(45),
    createdByUserId: "suba-admin",
    tagSlugs: ["web-development", "ui-ux"],
  },
  {
    title: "Brand Designer (Contract)",
    slug: "brand-designer-contract",
    excerpt: "Support brand refreshes with visual identity exploration.",
    description:
      "<p>Deliver identity concepts, style guides, and rollout assets for fast-moving clients. Contract role with project-based timelines.</p>",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1529333166433-1a6b0d67be04?auto=format&fit=crop&w=1400&q=80",
    department: "Brand",
    location: "Remote",
    workplaceType: "REMOTE",
    employmentType: "CONTRACT",
    seniority: "MID",
    salaryMin: 40000,
    salaryMax: 60000,
    salaryCurrency: "USD",
    status: "CLOSED",
    publishedAt: daysAgo(90),
    deadlineAt: daysAgo(10),
    createdByUserId: "suba-admin",
    tagSlugs: ["branding", "ui-ux"],
  },
  {
    title: "Operations Coordinator",
    slug: "operations-coordinator",
    excerpt: "Keep projects on track and support client communications.",
    description:
      "<p>Coordinate schedules, manage vendor logistics, and ensure project milestones are tracked across teams.</p>",
    department: "Operations",
    location: "Addis Ababa",
    workplaceType: "ONSITE",
    employmentType: "FULL_TIME",
    seniority: "ENTRY",
    status: "DRAFT",
    createdByUserId: "suba-admin",
    tagSlugs: ["product-strategy"],
  },
  {
    title: "Product Marketing Intern",
    slug: "product-marketing-intern",
    excerpt: "Support launches with research, messaging, and content.",
    description:
      "<p>Assist with market research, craft launch briefs, and help the team translate product value into clear messaging.</p>",
    department: "Marketing",
    location: "Remote",
    workplaceType: "REMOTE",
    employmentType: "INTERNSHIP",
    seniority: "ENTRY",
    salaryMin: 15000,
    salaryMax: 25000,
    salaryCurrency: "USD",
    applyEmail: "marketing@suba.studio",
    status: "PUBLISHED",
    publishedAt: daysAgo(2),
    deadlineAt: daysFromNow(14),
    createdByUserId: "suba-admin",
    tagSlugs: ["product-strategy", "data-viz"],
  },
];

export const vacancyApplicationSeeds: SeedVacancyApplication[] = [
  {
    vacancySlug: "senior-product-designer",
    fullName: "Liya Bekele",
    email: "liya.bekele@example.com",
    phone: "+251-91-555-0123",
    resumeUrl: "https://example.com/resumes/liya-bekele.pdf",
    portfolioUrl: "https://behance.net/liya-bekele",
    linkedinUrl: "https://www.linkedin.com/in/liya-bekele",
    coverLetter:
      "Excited to bring product design leadership and systems thinking to Suba's client engagements.",
    status: "REVIEWING",
    createdAt: daysAgo(3),
  },
  {
    vacancySlug: "senior-product-designer",
    fullName: "Sara Abdella",
    email: "sara.abdella@example.com",
    resumeUrl: "https://example.com/resumes/sara-abdella.pdf",
    portfolioUrl: "https://dribbble.com/sara-abdella",
    status: "SUBMITTED",
    createdAt: daysAgo(1),
  },
  {
    vacancySlug: "frontend-engineer",
    fullName: "Yohannes Alemu",
    email: "yohannes.alemu@example.com",
    phone: "+251-92-222-0098",
    resumeUrl: "https://example.com/resumes/yohannes-alemu.pdf",
    portfolioUrl: "https://github.com/yohannes-alemu",
    coverLetter: "Focused on accessible UI delivery and design system tooling.",
    status: "SHORTLISTED",
    createdAt: daysAgo(2),
  },
  {
    vacancySlug: "frontend-engineer",
    fullName: "Rahel Abebe",
    email: "rahel.abebe@example.com",
    resumeUrl: "https://example.com/resumes/rahel-abebe.pdf",
    linkedinUrl: "https://www.linkedin.com/in/rahel-abebe",
    status: "SUBMITTED",
    createdAt: daysAgo(1),
  },
  {
    vacancySlug: "brand-designer-contract",
    fullName: "Khalid Yimer",
    email: "khalid.yimer@example.com",
    resumeUrl: "https://example.com/resumes/khalid-yimer.pdf",
    portfolioUrl: "https://dribbble.com/khalid-yimer",
    status: "REJECTED",
    createdAt: daysAgo(20),
    notes: "Strong visuals but limited brand system experience.",
  },
  {
    vacancySlug: "product-marketing-intern",
    fullName: "Hanna Tesfaye",
    email: "hanna.tesfaye@example.com",
    resumeUrl: "https://example.com/resumes/hanna-tesfaye.pdf",
    portfolioUrl: "https://hanna-tesfaye.notion.site",
    status: "SUBMITTED",
    createdAt: daysAgo(1),
  },
];

export const socialSeeds: InferInsertModel<typeof socials>[] = [
  {
    title: "LinkedIn",
    baseUrl: "https://www.linkedin.com/company/",
    iconUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg",
  },
  {
    title: "Instagram",
    baseUrl: "https://www.instagram.com/",
    iconUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg",
  },
  {
    title: "X",
    baseUrl: "https://x.com/",
    iconUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/x.svg",
  },
  {
    title: "Dribbble",
    baseUrl: "https://dribbble.com/",
    iconUrl:
      "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/dribbble.svg",
  },
];

export const userSeeds: InferInsertModel<typeof user>[] = [
  {
    id: "suba-admin",
    name: "Suba Admin",
    email: "admin@suba.studio",
    emailVerified: true,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "suba-editor",
    name: "Suba Editor",
    email: "editor@suba.studio",
    emailVerified: true,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
    createdAt: now(),
    updatedAt: now(),
  },
];

export const userProfileSeeds: InferInsertModel<typeof userProfiles>[] = [
  {
    userId: "suba-admin",
    firstName: "Suba",
    lastName: "Admin",
    headshotUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    role: "ADMIN",
    phoneNumber: "+251-90-000-0000",
  },
  {
    userId: "suba-editor",
    firstName: "Suba",
    lastName: "Editor",
    headshotUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
    role: "BLOGGER",
    phoneNumber: "+1-404-555-0101",
  },
];

export const userSocialHandleSeeds = [
  {
    userId: "suba-admin",
    socialTitle: "LinkedIn",
    handle: "suba-design-development",
    fullUrl: "https://www.linkedin.com/company/suba-design-development",
  },
  {
    userId: "suba-admin",
    socialTitle: "X",
    handle: "suba_studio",
    fullUrl: "https://x.com/suba_studio",
  },
  {
    userId: "suba-editor",
    socialTitle: "Dribbble",
    handle: "suba-design",
    fullUrl: "https://dribbble.com/suba-design",
  },
];

export const companyMemberSeeds: InferInsertModel<typeof companyMembers>[] = [
  {
    firstName: "Nati",
    lastName: "Negus",
    title: "CEO",
  },
  {
    firstName: "Hanna",
    lastName: "Tesfaye",
    title: "Head of Design",
  },
  {
    firstName: "Biruk",
    lastName: "Kebede",
    title: "Head of Engineering",
  },
  {
    firstName: "Rahel",
    lastName: "Abebe",
    title: "Product Manager",
  },
  {
    firstName: "Khalid",
    lastName: "Yimer",
    title: "Frontend Engineer",
  },
];

export const blogContentSeeds: SeedBlog[] = blogSeeds;
export const caseStudyContentSeeds: SeedCaseStudy[] = caseStudySeeds;
export const serviceContentSeeds: SeedService[] = serviceSeeds;
export const productContentSeeds: SeedProduct[] = productSeeds;
export const businessSectorContentSeeds: SeedBusinessSector[] =
  businessSectorSeeds;

// Empty shells for session/account to keep FK-ready, intentionally not seeded with data
export const accountSeeds: InferInsertModel<typeof account>[] = [];
export const sessionSeeds: InferInsertModel<typeof session>[] = [];
