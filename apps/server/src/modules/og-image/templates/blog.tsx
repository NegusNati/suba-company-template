/** @jsxImportSource react */
import type React from "react";

import {
  BaseTemplate,
  OgHeader,
  OgTitle,
  OgDescription,
  OgFooter,
  OgTags,
} from "./base";
import type { OgImageData } from "../types";

interface BlogTemplateProps {
  data: OgImageData;
}

/**
 * Blog Post OG Image Template
 */
export const BlogTemplate = ({
  data,
}: BlogTemplateProps): React.ReactElement => {
  return (
    <BaseTemplate data={data}>
      {/* Header with category */}
      <OgHeader category={data.category || "Blog"} type={data.type} />

      {/* Main content area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <OgTitle title={data.title} />
        {data.description && <OgDescription description={data.description} />}
        {data.tags && data.tags.length > 0 && <OgTags tags={data.tags} />}
      </div>

      {/* Footer with meta */}
      <OgFooter
        author={data.author}
        date={data.date}
        readTime={data.readTime}
      />
    </BaseTemplate>
  );
};
