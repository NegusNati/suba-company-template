import React from "react";

import { LexicalViewer } from "@/components/common/rich-text/LexicalViewer";

interface ContentSectionProps {
  title: string;
  content: string | null | undefined;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  title,
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
