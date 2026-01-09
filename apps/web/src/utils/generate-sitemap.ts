interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
}

interface SitemapOptions {
  baseUrl: string;
  routes: SitemapUrl[];
  prettyPrint?: boolean;
}

export function generateSitemap(options: SitemapOptions): string {
  const { baseUrl, routes, prettyPrint = true } = options;
  const indent = prettyPrint ? "  " : "";
  const newline = prettyPrint ? "\n" : "";

  const header = `<?xml version="1.0" encoding="UTF-8"?>${newline}<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${newline}`;

  const urls = routes
    .map((route) => {
      const url = `${indent}<url>${newline}${indent}${indent}<loc>${baseUrl}${route.loc}</loc>${newline}`;

      const lastmod = route.lastmod
        ? `${indent}${indent}<lastmod>${route.lastmod}</lastmod>${newline}`
        : "";

      const changefreq = route.changefreq
        ? `${indent}${indent}<changefreq>${route.changefreq}</changefreq>${newline}`
        : "";

      const priority =
        route.priority !== undefined
          ? `${indent}${indent}<priority>${route.priority}</priority>${newline}`
          : "";

      return `${url}${lastmod}${changefreq}${priority}${indent}</url>`;
    })
    .join(newline);

  const footer = `${newline}</urlset>`;

  return `${header}${urls}${footer}`;
}

export function getDefaultRoutes(): SitemapUrl[] {
  const today = new Date().toISOString().split("T")[0];

  return [
    {
      loc: "/",
      lastmod: today,
      changefreq: "daily",
      priority: 1.0,
    },
    {
      loc: "/about-us",
      lastmod: today,
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      loc: "/services",
      lastmod: today,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: "/products",
      lastmod: today,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: "/projects",
      lastmod: today,
      changefreq: "weekly",
      priority: 0.8,
    },
    {
      loc: "/blogs",
      lastmod: today,
      changefreq: "daily",
      priority: 0.7,
    },
    {
      loc: "/contact-us",
      lastmod: today,
      changefreq: "monthly",
      priority: 0.7,
    },
    {
      loc: "/schedule-a-call",
      lastmod: today,
      changefreq: "monthly",
      priority: 0.6,
    },
  ];
}

export function getDynamicRoutes(
  items: Array<{ slug: string; updatedAt?: Date | string }>,
  baseRoute: string,
  changefreq: SitemapUrl["changefreq"] = "weekly",
  priority = 0.7,
): SitemapUrl[] {
  return items.map((item) => ({
    loc: `${baseRoute}/${item.slug}`,
    lastmod: item.updatedAt
      ? new Date(item.updatedAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    changefreq,
    priority,
  }));
}

export async function generateFullSitemap(
  baseUrl: string,
  options?: {
    products?: Array<{ slug: string; updatedAt?: Date | string }>;
    projects?: Array<{ slug: string; updatedAt?: Date | string }>;
    blogs?: Array<{ slug: string; updatedAt?: Date | string }>;
    prettyPrint?: boolean;
  },
): Promise<string> {
  const routes: SitemapUrl[] = [...getDefaultRoutes()];

  if (options?.products) {
    routes.push(
      ...getDynamicRoutes(options.products, "/products", "weekly", 0.8),
    );
  }

  if (options?.projects) {
    routes.push(
      ...getDynamicRoutes(options.projects, "/projects", "monthly", 0.7),
    );
  }

  if (options?.blogs) {
    routes.push(...getDynamicRoutes(options.blogs, "/blogs", "daily", 0.6));
  }

  return generateSitemap({
    baseUrl,
    routes,
    prettyPrint: options?.prettyPrint ?? true,
  });
}
