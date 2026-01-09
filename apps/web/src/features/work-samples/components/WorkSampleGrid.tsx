import React from "react";

import { WorkSampleCard } from "./WorkSampleCard";
import type { WorkSampleListItem } from "../lib/types";

interface WorkSampleGridProps {
  samples: WorkSampleListItem[];
}

export const WorkSampleGrid: React.FC<WorkSampleGridProps> = ({ samples }) => {
  if (samples.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No work samples found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {samples.map((sample, index) => (
        <WorkSampleCard
          key={`${sample.type}-${sample.id}`}
          sample={sample}
          index={index}
        />
      ))}
    </div>
  );
};
