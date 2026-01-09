/** @jsxImportSource react */
import type React from "react";

import {
  BaseTemplate,
  OgHeader,
  OgTitle,
  OgDescription,
  OgFooter,
} from "./base";
import type { OgImageData } from "../types";

interface PageTemplateProps {
  data: OgImageData;
}

/**
 * Generic Page OG Image Template
 */
export const PageTemplate = ({
  data,
}: PageTemplateProps): React.ReactElement => {
  return (
    <BaseTemplate data={data}>
      {/* Header */}
      <OgHeader category={data.category} type={data.type} />

      {/* Main content */}
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
      </div>

      {/* Footer */}
      <OgFooter />
    </BaseTemplate>
  );
};
