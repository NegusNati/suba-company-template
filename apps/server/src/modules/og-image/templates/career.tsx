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

interface CareerTemplateProps {
  data: OgImageData;
}

/**
 * Career/Vacancy OG Image Template
 */
export const CareerTemplate = ({
  data,
}: CareerTemplateProps): React.ReactElement => {
  return (
    <BaseTemplate data={data}>
      {/* Header with hiring badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <OgHeader category={data.category || "Careers"} type={data.type} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#22c55e",
            borderRadius: "8px",
            padding: "8px 16px",
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            We're Hiring
          </span>
        </div>
      </div>

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

        {/* Job details */}
        {data.tags && data.tags.length > 0 && (
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {data.tags.map((tag, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  padding: "10px 16px",
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  {tag}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <OgFooter />
    </BaseTemplate>
  );
};
