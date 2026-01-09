import React from "react";

interface ProjectVisualProps {
  category: string;
  seed: number;
}

const hues = [25, 200, 150, 280, 340];

const getColorFromSeed = (seed: number, opacity = 1) => {
  const hue = hues[seed % hues.length];
  return `hsla(${hue}, 70%, 60%, ${opacity})`;
};

export const ProjectVisual: React.FC<ProjectVisualProps> = ({
  category,
  seed,
}) => {
  const color = getColorFromSeed(seed);
  const bg = getColorFromSeed(seed, 0.1);

  switch (category) {
    case "Web":
      return (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 150"
          fill="none"
          className="drop-shadow-sm"
        >
          <rect x="20" y="20" width="160" height="110" rx="4" fill="white" />
          <rect x="20" y="20" width="160" height="20" rx="4" fill="#f3f4f6" />
          <circle cx="30" cy="30" r="3" fill="#e5e7eb" />
          <circle cx="40" cy="30" r="3" fill="#e5e7eb" />
          <rect
            x="35"
            y="55"
            width="60"
            height="8"
            rx="2"
            fill={color}
            opacity="0.5"
          />
          <rect x="35" y="70" width="90" height="4" rx="2" fill="#e5e7eb" />
          <rect x="35" y="80" width="80" height="4" rx="2" fill="#e5e7eb" />
          <rect x="110" y="55" width="55" height="60" rx="2" fill={bg} />
        </svg>
      );
    case "Apps":
      return (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 150"
          fill="none"
          className="drop-shadow-sm"
        >
          <rect
            x="70"
            y="10"
            width="60"
            height="130"
            rx="8"
            fill="white"
            stroke="#f3f4f6"
            strokeWidth="2"
          />
          <rect x="80" y="25" width="40" height="30" rx="4" fill={bg} />
          <rect x="80" y="65" width="40" height="8" rx="2" fill="#e5e7eb" />
          <rect x="80" y="80" width="40" height="8" rx="2" fill="#e5e7eb" />
          <rect x="80" y="95" width="25" height="8" rx="2" fill={color} />
          <circle cx="100" cy="125" r="4" fill="#f3f4f6" />
        </svg>
      );
    case "UI/UX":
      return (
        <svg width="100%" height="100%" viewBox="0 0 200 150" fill="none">
          <rect
            x="40"
            y="30"
            width="50"
            height="70"
            rx="2"
            fill="white"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <rect
            x="110"
            y="50"
            width="50"
            height="70"
            rx="2"
            fill="white"
            stroke="#9ca3af"
            strokeWidth="1.5"
          />
          <path d="M90 65 H 110" stroke="#d1d5db" strokeWidth="1.5" />
          <circle cx="110" cy="65" r="3" fill="#d1d5db" />
          <circle cx="90" cy="65" r="3" fill={color} />
        </svg>
      );
    default:
      return (
        <div className="w-full h-full rounded-3xl" style={{ background: bg }}>
          <div
            className="w-full h-full"
            style={{ background: color, opacity: 0.15 }}
          />
        </div>
      );
  }
};
