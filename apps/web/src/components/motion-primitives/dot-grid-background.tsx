"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";

export interface DotGridBackgroundProps {
  /** Number of dot rows */
  rows?: number;
  /** Number of dot columns */
  columns?: number;
  /** Dot radius in pixels */
  dotRadius?: number;
  /** Distance between dot centers in pixels */
  gap?: number;
  /** Minimum opacity for dot shade variation */
  minOpacity?: number;
  /** Maximum opacity for dot shade variation */
  maxOpacity?: number;
  /** Dot color (CSS color value) */
  color?: string;
  /** Seed to keep the dot shades deterministic across renders */
  seed?: number | string;
  /** Stretch the grid to full viewport width (edge-to-edge) */
  fullBleed?: boolean;
  /** Extra padding from the edges in pixels */
  edgePadding?: number;
  /** Stagger every other row for a criss-cross pattern */
  stagger?: boolean;
  /** Additional CSS class names for the container */
  className?: string;
  /** Custom inline styles for the container */
  style?: CSSProperties;
}

interface Dot {
  id: string;
  cx: number;
  cy: number;
  opacity: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createRng = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * A structured dot-grid background that uses brand color
 * and varied opacity per dot to create a subtle texture.
 */
export function DotGridBackground({
  rows = 14,
  columns = 22,
  dotRadius = 2,
  gap = 20,
  minOpacity = 0.12,
  maxOpacity = 0.4,
  color = "var(--primary)",
  seed = "suba-dot-grid",
  fullBleed = true,
  edgePadding,
  stagger = true,
  className,
  style,
}: DotGridBackgroundProps) {
  const normalizedRows = Math.max(1, Math.floor(rows));
  const normalizedColumns = Math.max(1, Math.floor(columns));
  const normalizedGap = Math.max(1, gap);
  const padding =
    typeof edgePadding === "number"
      ? Math.max(0, edgePadding)
      : Math.max(0, dotRadius);
  const normalizedMinOpacity = clamp(Math.min(minOpacity, maxOpacity), 0, 1);
  const normalizedMaxOpacity = clamp(Math.max(minOpacity, maxOpacity), 0, 1);

  const { dots, width, height } = useMemo(() => {
    const seedValue =
      typeof seed === "number"
        ? seed
        : typeof seed === "string"
          ? hashString(seed)
          : 1;
    const rng = createRng(seedValue);

    const staggerOffset = stagger ? normalizedGap * 0.5 : 0;
    const gridWidth =
      padding * 2 + normalizedGap * (normalizedColumns - 1) + staggerOffset;
    const gridHeight = padding * 2 + normalizedGap * (normalizedRows - 1);
    const items: Dot[] = [];

    for (let row = 0; row < normalizedRows; row += 1) {
      const rowOffset = stagger && row % 2 === 1 ? staggerOffset : 0;
      for (let col = 0; col < normalizedColumns; col += 1) {
        const opacity =
          normalizedMinOpacity +
          (normalizedMaxOpacity - normalizedMinOpacity) * rng();
        items.push({
          id: `${row}-${col}`,
          cx: padding + col * normalizedGap + rowOffset,
          cy: padding + row * normalizedGap,
          opacity,
        });
      }
    }

    return { dots: items, width: gridWidth, height: gridHeight };
  }, [
    normalizedRows,
    normalizedColumns,
    normalizedGap,
    normalizedMinOpacity,
    normalizedMaxOpacity,
    padding,
    seed,
    stagger,
  ]);

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      top: 0,
      bottom: 0,
      left: fullBleed ? "50%" : 0,
      right: fullBleed ? "auto" : 0,
      width: fullBleed ? "100vw" : "100%",
      height: "100%",
      transform: fullBleed ? "translateX(-50%)" : undefined,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 0,
      ...style,
    }),
    [fullBleed, style],
  );

  return (
    <div className={className} style={containerStyle}>
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        {dots.map((dot) => (
          <circle
            key={dot.id}
            cx={dot.cx}
            cy={dot.cy}
            r={dotRadius}
            fill={color}
            fillOpacity={dot.opacity}
          />
        ))}
      </svg>
    </div>
  );
}

export default DotGridBackground;
