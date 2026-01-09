import React from "react";

import { LexicalViewer } from "@/components/common/rich-text/LexicalViewer";

interface ImpactSectionProps {
  title?: string;
  content?: string | null;
}

export const ImpactSection: React.FC<ImpactSectionProps> = ({
  title = "Impact And Result",
  content,
}) => {
  if (!content) return null;

  return (
    <section className="mb-10">
      <h2 className="text-xl md:text-2xl font-serif font-semibold text-foreground mb-4">
        {title}
      </h2>
      <div className="text-gray-600 leading-relaxed">
        <LexicalViewer content={content} />
      </div>
    </section>
  );
};
