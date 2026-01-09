import { useRouter } from "@tanstack/react-router";
import React from "react";

import {
  ClientInfo,
  ContentSection,
  ImpactSection,
  WorkSampleDetailHero,
  WorkSamplesGallery,
} from "./components";

import type { PublicCaseStudyDetail } from "@/lib/case-study";

interface CaseStudyDetailPageProps {
  caseStudy: PublicCaseStudyDetail;
}

export const CaseStudyDetailPage: React.FC<CaseStudyDetailPageProps> = ({
  caseStudy,
}) => {
  const router = useRouter();

  const handleBack = () => router.navigate({ to: "/projects" as never });

  const clientName = caseStudy.client?.title ?? null;

  return (
    <div className="w-full  min-h-screen pb-20">
      <div className="px-6 py-8 max-w-5xl mx-auto">
        {/* Hero Section - Centered Title with Tags */}
        <WorkSampleDetailHero title={caseStudy.title} tags={caseStudy.tags} />

        {/* Work Samples Gallery */}
        {caseStudy.images && caseStudy.images.length > 0 && (
          <WorkSamplesGallery
            images={caseStudy.images}
            title={caseStudy.title}
            onBack={handleBack}
          />
        )}

        {/* Client Info */}
        <ClientInfo clientName={clientName} />

        {/* Business Problem Section */}
        <ContentSection
          title="Business Problem And Requirements"
          content={caseStudy.problem}
        />

        {/* Solution Section */}
        <ContentSection title="The Solution" content={caseStudy.process} />

        {/* Impact Section */}
        <ImpactSection title="Impact And Result" content={caseStudy.impact} />
      </div>
    </div>
  );
};
