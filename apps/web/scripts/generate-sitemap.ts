/* eslint-disable no-console */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { generateFullSitemap } from "../src/utils/generate-sitemap";

async function main() {
  const baseUrl = process.env.VITE_SITE_URL || "https://yourdomain.com";

  console.log("🗺️  Generating sitemap...");

  try {
    const sitemap = await generateFullSitemap(baseUrl, {
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
