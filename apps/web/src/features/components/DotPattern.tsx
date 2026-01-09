import React from "react";

// SVG Dot Pattern Component to match the design visual
export const DotPattern: React.FC<{ small?: boolean }> = ({ small }) => {
  // Create a grid of dots
  const dots = [];
  const rows = small ? 8 : 12;
  const cols = small ? 10 : 18;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Randomize opacity slightly for organic texture (brand green + neutral mix)
      const isColored = Math.random() > 0.7;

      dots.push(
        <circle
          key={`${i}-${j}`}
          cx={j * (small ? 10 : 20) + 10}
          cy={i * (small ? 10 : 20) + 10}
          r={small ? 1.5 : 2}
          fill={isColored ? "var(--color-primary)" : "#D7E0D3"}
          fillOpacity={isColored ? 0.8 : 0.35}
        />,
      );
    }
  }

  return (
    <svg width="100%" height="100%" className="absolute inset-0 w-full h-full">
      {dots}
    </svg>
  );
};
