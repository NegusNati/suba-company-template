/**
 * Example usage of sitemap generation utilities
 * This file demonstrates various ways to use the sitemap generator
 */

/* eslint-disable no-console */
/* eslint-disable unused-imports/no-unused-vars */

import { writeFileSync } from "node:fs";

import {
  generateFullSitemap,
  generateSitemap,
  getDefaultRoutes,
  getDynamicRoutes,
} from "./generate-sitemap";

// Example 1: Basic sitemap with custom routes
export function example1_BasicSitemap() {
  const sitemap = generateSitemap({
    baseUrl: "https://yourdomain.com",
    routes: [
      {
        loc: "/",
        lastmod: "2025-10-28",
        changefreq: "daily",
        priority: 1.0,
      },
      {
        loc: "/about-us",
        changefreq: "monthly",
        priority: 0.8,
      },
      {
        loc: "/contact-us",
        priority: 0.7,
      },
    ],
    prettyPrint: true,
  });

  console.log(sitemap);
}

// Example 2: Using default routes
export function example2_DefaultRoutes() {
  const routes = getDefaultRoutes();

  const sitemap = generateSitemap({
    baseUrl: "https://yourdomain.com",
    routes,
  });

  writeFileSync("public/sitemap.xml", sitemap);
  console.log("Sitemap generated with default routes");
}

// Example 3: Adding dynamic product routes
export function example3_DynamicProducts() {
  const products = [
    { slug: "tija-hospitality", updatedAt: "2025-10-15" },
    { slug: "easyfind-job-portal", updatedAt: "2025-10-20" },
    { slug: "qr-employee-rating", updatedAt: "2025-10-22" },
    { slug: "complaint-handling-system", updatedAt: "2025-10-18" },
  ];

  const routes = [
    ...getDefaultRoutes(),
    ...getDynamicRoutes(products, "/products", "weekly", 0.8),
  ];

  const sitemap = generateSitemap({
    baseUrl: "https://yourdomain.com",
    routes,
  });

  console.log(`Generated sitemap with ${routes.length} URLs`);
}

// Example 4: Full sitemap with all dynamic data
export async function example4_FullSitemap() {
  const products = [
    { slug: "tija", updatedAt: new Date("2025-10-15") },
    { slug: "easyfind", updatedAt: new Date("2025-10-20") },
  ];

  const projects = [
    { slug: "esl-mobile-app", updatedAt: new Date("2025-10-10") },
    { slug: "bmla-platform", updatedAt: new Date("2025-09-25") },
  ];

  const blogs = [
    { slug: "digital-transformation-africa", updatedAt: "2025-10-25" },
    { slug: "software-engineering-trends", updatedAt: "2025-10-26" },
  ];

  const sitemap = await generateFullSitemap("https://yourdomain.com", {
    products,
    projects,
    blogs,
    prettyPrint: true,
  });

  writeFileSync("public/sitemap.xml", sitemap);
  console.log("Full sitemap generated successfully");
}

// Example 5: Different priorities for different sections
export function example5_CustomPriorities() {
  const routes = getDefaultRoutes();

  // Add high-priority service pages
  const services = ["web-development", "mobile-apps", "cloud-solutions"];
  services.forEach((slug) => {
    routes.push({
      loc: `/services/${slug}`,
      changefreq: "weekly",
      priority: 0.95, // Higher priority for main services
    });
  });

  // Add lower-priority archive pages
  routes.push({
    loc: "/blogs/archive",
    changefreq: "monthly",
    priority: 0.4,
  });

  const sitemap = generateSitemap({
    baseUrl: "https://yourdomain.com",
    routes,
  });

  console.log(sitemap);
}

// Example 6: Minified sitemap (no pretty print)
export function example6_MinifiedSitemap() {
  const sitemap = generateSitemap({
    baseUrl: "https://yourdomain.com",
    routes: getDefaultRoutes(),
    prettyPrint: false, // Smaller file size
  });

  console.log(`Minified size: ${Buffer.byteLength(sitemap)} bytes`);
}

// Example 7: Custom change frequencies based on content type
export function example7_CustomChangeFrequencies() {
  const products = [
    { slug: "product-1", updatedAt: "2025-10-28" },
    { slug: "product-2", updatedAt: "2025-10-28" },
  ];

  const news = [
    { slug: "news-1", updatedAt: "2025-10-28" },
    { slug: "news-2", updatedAt: "2025-10-28" },
  ];

  const routes = [
    ...getDefaultRoutes(),
    ...getDynamicRoutes(products, "/products", "weekly", 0.8), // Products change weekly
    ...getDynamicRoutes(news, "/news", "hourly", 0.9), // News changes frequently
  ];

  const sitemap = generateSitemap({
    baseUrl: "https://yourdomain.com",
    routes,
  });

  console.log(`Generated sitemap with mixed frequencies`);
}

// Example 8: Filtering routes based on conditions
export function example8_ConditionalRoutes() {
  const allProducts = [
    { slug: "product-1", updatedAt: "2025-10-28", published: true },
    { slug: "product-2", updatedAt: "2025-10-28", published: false },
    { slug: "product-3", updatedAt: "2025-10-28", published: true },
  ];

  // Only include published products
  const publishedProducts = allProducts.filter((p) => p.published);

  const routes = [
    ...getDefaultRoutes(),
    ...getDynamicRoutes(publishedProducts, "/products", "weekly", 0.8),
  ];

  const sitemap = generateSitemap({
    baseUrl: "https://yourdomain.com",
    routes,
  });

  console.log(`Included ${publishedProducts.length} published products`);
}

// Run examples
if (import.meta.main) {
  console.log("Running sitemap generation examples...\n");

  console.log("Example 1: Basic sitemap");
  example1_BasicSitemap();

  console.log("\nExample 3: Dynamic products");
  example3_DynamicProducts();

  console.log("\nExample 6: Minified sitemap");
  example6_MinifiedSitemap();

  console.log("\nExample 8: Conditional routes");
  example8_ConditionalRoutes();
}
