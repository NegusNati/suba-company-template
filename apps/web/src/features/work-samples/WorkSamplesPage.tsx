import React, { useState, useMemo } from "react";

import { TagFilter, WorkSampleGrid } from "./components";
import { caseStudyToWorkSample, productToWorkSample } from "./lib/types";

import hammer from "@/assets/work-samples/hamer.svg";
import { ContactCTASection } from "@/components/common/ContactCTASection";
import { PageHeader } from "@/components/common/PageHeader";
import { usePublicCaseStudiesQuery } from "@/lib/case-study";
import { usePublicProductsQuery } from "@/lib/products";
import { usePublicTagsQuery } from "@/lib/tags";

export const WorkSamplesPage: React.FC = () => {
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  // Fetch tags for the filter
  const { data: tagsData } = usePublicTagsQuery({ limit: 50 });
  const tags = tagsData?.data ?? [];

  // Fetch products and case studies (optionally filtered by tag)
  const { data: productsData, isPending: productsLoading } =
    usePublicProductsQuery({
      limit: 50,
      tagId: selectedTagId ?? undefined,
    });

  const { data: caseStudiesData, isPending: caseStudiesLoading } =
    usePublicCaseStudiesQuery({
      limit: 50,
      tagId: selectedTagId ?? undefined,
    });

  // Transform and combine the data
  const workSamples = useMemo(() => {
    const products = (productsData?.data ?? []).map(productToWorkSample);
    const caseStudies = (caseStudiesData?.data ?? []).map(
      caseStudyToWorkSample,
    );

    // Interleave products and case studies for variety
    const combined = [...caseStudies, ...products];
    return combined;
  }, [productsData, caseStudiesData]);

  const isLoading = productsLoading || caseStudiesLoading;

  return (
    <>
      <PageHeader
        image={hammer}
        imageAlt="hammer"
        imageClassName="scale-70 md:scale-80 translate-y-[-42px] md:translate-y-[-35px] "
      />
      <div className="w-full  min-h-screen pb-20">
        <div className="px-6 py-8 max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-[32px] md:text-5xl font-serif font-medium text-foreground tracking-tight mb-2">
              Work Samples
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              Here are some examples of client work.
            </p>
          </header>

          {/* Tag Filter */}
          <div className="mb-10">
            <TagFilter
              tags={tags}
              selectedTagId={selectedTagId}
              onTagSelect={setSelectedTagId}
            />
          </div>

          {/* Work Samples Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                Loading work samples...
              </p>
            </div>
          ) : (
            <WorkSampleGrid samples={workSamples} />
          )}
        </div>
        <ContactCTASection />
      </div>
    </>
  );
};
