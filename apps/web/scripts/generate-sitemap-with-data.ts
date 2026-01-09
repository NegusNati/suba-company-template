/* eslint-disable no-console */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import axios from "axios";

import { generateFullSitemap } from "../src/utils/generate-sitemap";

interface Product {
  id: string;
  slug: string;
  updatedAt?: string;
}

interface Project {
  id: string;
  slug: string;
  updatedAt?: string;
}

interface Blog {
  id: string;
  slug: string;
  updatedAt?: string;
}

async function fetchDynamicData() {
  const serverUrl = process.env.VITE_SERVER_URL;

  if (!serverUrl) {
    console.warn(
      "⚠️  VITE_SERVER_URL not set. Generating sitemap with static routes only.",
    );
    return { products: [], projects: [], blogs: [] };
  }

  try {
    const [productsRes, projectsRes, blogsRes] = await Promise.allSettled([
      axios.get<Product[]>(`${serverUrl}/api/v1/products`),
      axios.get<Project[]>(`${serverUrl}/api/v1/projects`),
      axios.get<Blog[]>(`${serverUrl}/api/v1/blogs`),
    ]);

    return {
      products:
        productsRes.status === "fulfilled" ? productsRes.value.data : [],
      projects:
        projectsRes.status === "fulfilled" ? projectsRes.value.data : [],
      blogs: blogsRes.status === "fulfilled" ? blogsRes.value.data : [],
    };
  } catch (error) {
    console.error("⚠️  Error fetching dynamic data:", error);
    return { products: [], projects: [], blogs: [] };
  }
}

async function main() {
  const baseUrl = process.env.VITE_SITE_URL || "https://yourdomain.com";

  console.log("🗺️  Generating sitemap with dynamic data...");

  try {
    const dynamicData = await fetchDynamicData();

    console.log(`📦 Fetched ${dynamicData.products.length} products`);
    console.log(`📁 Fetched ${dynamicData.projects.length} projects`);
    console.log(`📝 Fetched ${dynamicData.blogs.length} blogs`);

    const sitemap = await generateFullSitemap(baseUrl, {
      products: dynamicData.products,
      projects: dynamicData.projects,
      blogs: dynamicData.blogs,
      prettyPrint: true,
    });

    const outputPath = resolve(process.cwd(), "public", "sitemap.xml");

    writeFileSync(outputPath, sitemap, "utf-8");

    console.log(`✅ Sitemap generated successfully at: ${outputPath}`);
    console.log(`📍 Base URL: ${baseUrl}`);
    console.log(`📝 Total URLs: ${sitemap.split("<url>").length - 1}`);
  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
    process.exit(1);
  }
}

main();
