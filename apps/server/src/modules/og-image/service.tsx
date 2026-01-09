/** @jsxImportSource react */
import { ImageResponse } from "@vercel/og";
import type React from "react";

import {
  BlogTemplate,
  ServiceTemplate,
  ProjectTemplate,
  CareerTemplate,
  PageTemplate,
  DefaultTemplate,
} from "./templates";
import type { OgImageData, OgImageOptions, OgImageType } from "./types";
import { DEFAULT_OG_OPTIONS } from "./types";
import { logger } from "../../shared/logger";

// Google Fonts URL for Playfair Display
const PLAYFAIR_FONT_URL =
  "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtXK-F2qC0s.woff";

/**
 * Fetch and cache the Playfair Display font
 */
let fontCache: ArrayBuffer | null = null;

async function getPlayfairFont(): Promise<ArrayBuffer> {
  if (fontCache) {
    return fontCache;
  }

  try {
    const response = await fetch(PLAYFAIR_FONT_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.statusText}`);
    }
    fontCache = await response.arrayBuffer();
    return fontCache;
  } catch (error) {
    logger.error("Error fetching Playfair font", error as Error);
    throw error;
  }
}

/**
 * Get the appropriate template based on image type
 */
function getTemplate(data: OgImageData): React.ReactElement {
  switch (data.type) {
    case "blog":
      return <BlogTemplate data={data} />;
    case "service":
      return <ServiceTemplate data={data} />;
    case "project":
      return <ProjectTemplate data={data} />;
    case "career":
      return <CareerTemplate data={data} />;
    case "page":
      return <PageTemplate data={data} />;
    case "default":
    default:
      return <DefaultTemplate />;
  }
}

/**
 * Generate an OG image from the given data
 */
export async function generateOgImage(
  data: OgImageData,
  options: OgImageOptions = {},
): Promise<ImageResponse> {
  const { width, height, debug } = { ...DEFAULT_OG_OPTIONS, ...options };

  // Fetch the font
  const playfairFont = await getPlayfairFont();

  // Get the appropriate template
  const template = getTemplate(data);

  // Generate the image
  return new ImageResponse(template, {
    width,
    height,
    debug,
    fonts: [
      {
        name: "Playfair Display",
        data: playfairFont,
        style: "normal",
        weight: 700,
      },
    ],
    headers: {
      // Cache for 1 week, allow stale content while revalidating
      "Cache-Control":
        "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}

/**
 * Generate a default OG image
 */
export async function generateDefaultOgImage(
  options: OgImageOptions = {},
): Promise<ImageResponse> {
  return generateOgImage({ title: "", type: "default" }, options);
}

export type { OgImageData, OgImageOptions, OgImageType };
