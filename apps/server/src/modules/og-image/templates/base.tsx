/** @jsxImportSource react */
import type React from "react";

import type { OgImageData } from "../types";
import { BRAND_COLORS } from "../types";

interface BaseTemplateProps {
  data: OgImageData;
  children?: React.ReactNode;
}

/**
 * Base OG Image Template with company branding
 */
export const BaseTemplate = ({
  data,
  children,
}: BaseTemplateProps): React.ReactElement => {
  const hasImage = !!data.imageUrl;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: hasImage
          ? `linear-gradient(135deg, ${BRAND_COLORS.secondary} 0%, ${BRAND_COLORS.primary} 100%)`
          : `linear-gradient(135deg, ${BRAND_COLORS.secondary} 0%, ${BRAND_COLORS.primary} 100%)`,
        fontFamily: '"Playfair Display", serif',
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage:
            "radial-gradient(circle at 25% 25%, white 2px, transparent 2px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Featured image overlay */}
      {hasImage && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "50%",
            height: "100%",
            display: "flex",
          }}
        >
          <img
            src={data.imageUrl!}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.4,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(90deg, rgba(15,23,42,1) 0%, rgba(15,23,42,0.8) 50%, rgba(15,23,42,0.4) 100%)",
            }}
          />
        </div>
      )}

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          padding: "60px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Header section with category badge
 */
export const OgHeader = ({
  category,
  type,
}: {
  category?: string;
  type: string;
}): React.ReactElement => {
  const displayCategory =
    category || type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {/* Category badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          borderRadius: "8px",
          padding: "8px 16px",
          backdropFilter: "blur(10px)",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: "18px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          {displayCategory}
        </span>
      </div>
    </div>
  );
};

/**
 * Main title section
 */
export const OgTitle = ({ title }: { title: string }): React.ReactElement => {
  // Truncate title if too long
  const displayTitle =
    title.length > 80 ? `${title.substring(0, 77)}...` : title;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        maxWidth: "800px",
      }}
    >
      <h1
        style={{
          fontSize: displayTitle.length > 50 ? "48px" : "56px",
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1.2,
          margin: 0,
          textShadow: "0 2px 10px rgba(0,0,0,0.3)",
        }}
      >
        {displayTitle}
      </h1>
    </div>
  );
};

/**
 * Description section
 */
export const OgDescription = ({
  description,
}: {
  description: string;
}): React.ReactElement => {
  // Truncate description if too long
  const displayDesc =
    description.length > 150
      ? `${description.substring(0, 147)}...`
      : description;

  return (
    <p
      style={{
        fontSize: "24px",
        color: "rgba(255, 255, 255, 0.8)",
        lineHeight: 1.5,
        margin: 0,
        maxWidth: "700px",
      }}
    >
      {displayDesc}
    </p>
  );
};

/**
 * Footer section with branding
 */
export const OgFooter = ({
  author,
  date,
  readTime,
}: {
  author?: string;
  date?: string;
  readTime?: number;
}): React.ReactElement => {
  const metaItems: string[] = [];
  if (author) metaItems.push(`By ${author}`);
  if (date) metaItems.push(date);
  if (readTime) metaItems.push(`${readTime} min read`);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Meta info */}
      {metaItems.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {metaItems.map((item, index) => (
            <span
              key={index}
              style={{
                fontSize: "18px",
                color: "rgba(255, 255, 255, 0.7)",
              }}
            >
              {item}
              {index < metaItems.length - 1 && (
                <span style={{ marginLeft: "20px", opacity: 0.5 }}>•</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Brand logo/name */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: BRAND_COLORS.primary,
            }}
          >
            S
          </span>
        </div>
        <span
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#ffffff",
          }}
        >
          Your Company
        </span>
      </div>
    </div>
  );
};

/**
 * Tags section
 */
export const OgTags = ({ tags }: { tags: string[] }): React.ReactElement => {
  const displayTags = tags.slice(0, 3); // Show max 3 tags

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      {displayTags.map((tag, index) => (
        <span
          key={index}
          style={{
            fontSize: "14px",
            color: "rgba(255, 255, 255, 0.9)",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: "6px 12px",
            borderRadius: "6px",
          }}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
};
