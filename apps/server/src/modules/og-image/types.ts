/**
 * OG Image Module Types
 */

export type OgImageType =
  | "blog"
  | "service"
  | "project"
  | "career"
  | "page"
  | "default";

export interface OgImageData {
  title: string;
  description?: string;
  imageUrl?: string | null;
  type: OgImageType;
  category?: string;
  author?: string;
  date?: string;
  readTime?: number;
  tags?: string[];
}

export interface OgImageOptions {
  width?: number;
  height?: number;
  debug?: boolean;
}

export const DEFAULT_OG_OPTIONS: Required<OgImageOptions> = {
  width: 1200,
  height: 630,
  debug: false,
};

// Brand colors
export const BRAND_COLORS = {
  primary: "#0600ab",
  secondary: "#0f172a",
  background: "#ffffff",
  backgroundDark: "#0f172a",
  text: "#1e293b",
  textLight: "#64748b",
  accent: "#3b82f6",
} as const;
