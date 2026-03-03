import { motion } from "motion/react";
import React from "react";

import { WorkSampleCard } from "./WorkSampleCard";

import { usePublicCaseStudiesQuery } from "@/lib/case-study/case-study-query";

export const WorkSamplesSection: React.FC = () => {
  const { data: response } = usePublicCaseStudiesQuery({ limit: 6 });

  const caseStudies = response?.data || [];

  if (caseStudies.length === 0) {
    return null;
  }

  return (
    <section className="px-6 py-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="text-2xl md:text-3xl font-semibold text-foreground mb-2"
        >
          Work Samples
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-sm text-muted-foreground"
        >
          Here are some examples of client work.
        </motion.p>
      </div>

      {/* Projects Grid - 2 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {caseStudies.map((caseStudy) => (
          <WorkSampleCard
            key={caseStudy.id}
            project={{
              title: caseStudy.title,
              image: caseStudy.featuredImage || "",
              caseStudyUrl: `/projects/${caseStudy.slug}`,
            }}
          />
        ))}
      </div>
    </section>
  );
};
