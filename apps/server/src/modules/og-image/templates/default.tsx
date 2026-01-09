/** @jsxImportSource react */
import type React from "react";

import { BRAND_COLORS } from "../types";

/**
 * Default OG Image Template - Used when no specific page data is available
 */
export const DefaultTemplate = (): React.ReactElement => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(135deg, ${BRAND_COLORS.secondary} 0%, ${BRAND_COLORS.primary} 100%)`,
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

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: "60px",
          position: "relative",
          zIndex: 10,
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          }}
        >
          <span
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: BRAND_COLORS.primary,
            }}
          >
            S
          </span>
        </div>

        {/* Brand name */}
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            marginBottom: "20px",
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          Your Company
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: "28px",
            color: "rgba(255, 255, 255, 0.8)",
            margin: 0,
            maxWidth: "700px",
          }}
        >
          Software Engineering & Digital Innovation
        </p>

        {/* Service highlights */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "50px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["Software Development", "Digital Products", "Cloud Platforms"].map(
            (service, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  padding: "12px 24px",
                }}
              >
                <span
                  style={{
                    fontSize: "18px",
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  {service}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
};
