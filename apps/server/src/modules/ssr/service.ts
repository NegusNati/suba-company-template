import type { PageMeta, SsrConfig } from "./types";
import { SSR_CONFIG } from "./types";

/**
 * Generate the HTML shell with meta tags for social media crawlers
 */
export function generateHtmlShell(
  meta: PageMeta,
  config: SsrConfig = SSR_CONFIG,
): string {
  const fullOgImage = meta.ogImage.startsWith("http")
    ? meta.ogImage
    : `${config.siteUrl}${meta.ogImage}`;

  const fullCanonicalUrl = meta.canonicalUrl.startsWith("http")
    ? meta.canonicalUrl
    : `${config.siteUrl}${meta.canonicalUrl}`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>${escapeHtml(meta.title)}</title>
    <meta name="title" content="${escapeHtml(meta.title)}" />
    <meta name="description" content="${escapeHtml(meta.description)}" />
    ${meta.keywords ? `<meta name="keywords" content="${escapeHtml(meta.keywords)}" />` : ""}
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${escapeHtml(fullCanonicalUrl)}" />

    <meta name="application-name" content="${escapeHtml(config.siteName)}" />
    <meta name="theme-color" content="#0600ab" />

    <!-- Open Graph -->
    <meta property="og:type" content="${escapeHtml(meta.ogType)}" />
    <meta property="og:url" content="${escapeHtml(fullCanonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:site_name" content="${escapeHtml(config.siteName)}" />
    <meta property="og:locale" content="${config.locale}" />
    <meta property="og:image" content="${escapeHtml(fullOgImage)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(meta.title)}" />
    ${meta.publishedTime ? `<meta property="article:published_time" content="${escapeHtml(meta.publishedTime)}" />` : ""}
    ${meta.modifiedTime ? `<meta property="article:modified_time" content="${escapeHtml(meta.modifiedTime)}" />` : ""}
    ${meta.author ? `<meta property="article:author" content="${escapeHtml(meta.author)}" />` : ""}
    ${meta.section ? `<meta property="article:section" content="${escapeHtml(meta.section)}" />` : ""}
    ${meta.tags?.map((tag) => `<meta property="article:tag" content="${escapeHtml(tag)}" />`).join("\n    ") || ""}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${escapeHtml(fullCanonicalUrl)}" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${escapeHtml(fullOgImage)}" />
    <meta name="twitter:site" content="${config.twitterHandle}" />
    <meta name="twitter:creator" content="${config.twitterHandle}" />
    <meta name="twitter:image:alt" content="${escapeHtml(meta.title)}" />

    <!-- Favicons -->
    <link rel="apple-touch-icon" sizes="180x180" href="/site/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/site/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/site/favicon-16x16.png" />
    <link rel="icon" type="image/x-icon" href="/site/favicon.ico" />

    <!-- Structured Data -->
    <script type="application/ld+json">
      ${generateStructuredData(meta, config)}
    </script>
  </head>
  <body>
    <div id="app">
      <noscript>
        <h1>${escapeHtml(meta.title)}</h1>
        <p>${escapeHtml(meta.description)}</p>
        <p>Please enable JavaScript to view this website.</p>
      </noscript>
    </div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

/**
 * Generate JSON-LD structured data
 */
function generateStructuredData(meta: PageMeta, config: SsrConfig): string {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": meta.ogType === "article" ? "BlogPosting" : "WebPage",
    name: meta.title,
    description: meta.description,
    url: meta.canonicalUrl.startsWith("http")
      ? meta.canonicalUrl
      : `${config.siteUrl}${meta.canonicalUrl}`,
    publisher: {
      "@type": "Organization",
      name: config.siteName,
      url: config.siteUrl,
    },
  };

  if (meta.ogType === "article") {
    if (meta.publishedTime) {
      data.datePublished = meta.publishedTime;
    }
    if (meta.modifiedTime) {
      data.dateModified = meta.modifiedTime;
    }
    if (meta.author) {
      data.author = {
        "@type": "Person",
        name: meta.author,
      };
    }
  }

  return JSON.stringify(data, null, 2);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Create default page meta
 */
export function createDefaultMeta(path: string): PageMeta {
  return {
    title: SSR_CONFIG.defaultTitle,
    description: SSR_CONFIG.defaultDescription,
    ogImage: SSR_CONFIG.defaultOgImage,
    ogType: "website",
    canonicalUrl: path,
  };
}

/**
 * Create blog post meta
 */
export function createBlogMeta(
  slug: string,
  blog: {
    title: string;
    excerpt: string | null;
    author: string | null;
    publishDate: string | null;
    tags?: { name: string }[];
  },
): PageMeta {
  return {
    title: `${blog.title} | ${SSR_CONFIG.siteName}`,
    description: blog.excerpt || SSR_CONFIG.defaultDescription,
    ogImage: `/api/og/blog/${slug}`,
    ogType: "article",
    canonicalUrl: `/blogs/${slug}`,
    author: blog.author || undefined,
    publishedTime: blog.publishDate || undefined,
    section: "Blog",
    tags: blog.tags?.map((t) => t.name),
  };
}

/**
 * Create service page meta
 */
export function createServiceMeta(
  slug: string,
  service: {
    title: string;
    excerpt: string | null;
  },
): PageMeta {
  return {
    title: `${service.title} | ${SSR_CONFIG.siteName}`,
    description: service.excerpt || SSR_CONFIG.defaultDescription,
    ogImage: `/api/og/service/${slug}`,
    ogType: "website",
    canonicalUrl: `/services/${slug}`,
    section: "Services",
  };
}

/**
 * Create project/case study meta
 */
export function createProjectMeta(
  slug: string,
  project: {
    title: string;
    excerpt: string | null;
    tags?: { name: string }[];
  },
): PageMeta {
  return {
    title: `${project.title} | ${SSR_CONFIG.siteName}`,
    description: project.excerpt || SSR_CONFIG.defaultDescription,
    ogImage: `/api/og/project/${slug}`,
    ogType: "article",
    canonicalUrl: `/projects/${slug}`,
    section: "Projects",
    tags: project.tags?.map((t) => t.name),
  };
}

/**
 * Create career/vacancy meta
 */
export function createCareerMeta(
  slug: string,
  career: {
    title: string;
    excerpt: string | null;
    department: string | null;
    location: string | null;
  },
): PageMeta {
  const description =
    career.excerpt ||
    `${career.title}${career.department ? ` in ${career.department}` : ""}${career.location ? ` - ${career.location}` : ""} at ${SSR_CONFIG.siteName}`;

  return {
    title: `${career.title} | Careers at ${SSR_CONFIG.siteName}`,
    description,
    ogImage: `/api/og/career/${slug}`,
    ogType: "website",
    canonicalUrl: `/careers/${slug}`,
    section: "Careers",
  };
}

/**
 * Create static page meta
 */
export function createStaticPageMeta(
  path: string,
  title: string,
  description: string,
): PageMeta {
  return {
    title: `${title} | ${SSR_CONFIG.siteName}`,
    description,
    ogImage: `/api/og/page?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
    ogType: "website",
    canonicalUrl: path,
  };
}
