import type { PublicCaseStudyListItem } from "@/lib/case-study";
import type { PublicProductListItem } from "@/lib/products";

// ============================================================================
// Unified Work Sample Types
// ============================================================================

export type WorkSampleType = "product" | "case-study";

/**
 * Unified work sample item for the list view
 * Combines both products and case studies into a single type
 */
export interface WorkSampleListItem {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  featuredImage: string | null;
  type: WorkSampleType;
  // Only for case studies
  clientName?: string | null;
}

/**
 * Transform a product list item to unified work sample format
 */
export function productToWorkSample(
  product: PublicProductListItem,
): WorkSampleListItem {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    featuredImage: product.featuredImage,
    type: "product",
  };
}

/**
 * Transform a case study list item to unified work sample format
 */
export function caseStudyToWorkSample(
  caseStudy: PublicCaseStudyListItem,
): WorkSampleListItem {
  return {
    id: caseStudy.id,
    slug: caseStudy.slug,
    title: caseStudy.title,
    description: caseStudy.excerpt,
    featuredImage: caseStudy.featuredImage,
    type: "case-study",
    clientName: caseStudy.clientName,
  };
}
