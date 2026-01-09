import { ArrowLeft } from "lucide-react";
import React from "react";

import { getWorkSampleImageUrl } from "../lib/work-samples-utils";

export interface GalleryImage {
  id: number;
  imageUrl: string;
  caption?: string | null;
  position?: number;
}

interface WorkSamplesGalleryProps {
  images: GalleryImage[];
  title: string;
  onBack: () => void;
}

export const WorkSamplesGallery: React.FC<WorkSamplesGalleryProps> = ({
  images,
  title,
  onBack,
}) => {
  // Sort images by position if available
  const sortedImages = [...images].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0),
  );

  return (
    <div className="mb-10">
      {/* Header with back button and dotted line */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors group shrink-0"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Work Samples</span>
        </button>
        <div className="flex-1 border-t border-dashed border-gray-300" />
      </div>

      {/* Image Gallery Container */}
      <div className="bg-primary/5 rounded-3xl border border-primary/10 overflow-hidden">
        {sortedImages.length > 0 ? (
          <div className="flex items-center py-2 justify-center overflow-x-auto pb-2">
            {sortedImages.map((image, index) => (
              <div key={image.id} className="shrink-0">
                <img
                  src={getWorkSampleImageUrl(image.imageUrl)}
                  alt={image.caption || `${title} - Image ${index + 1}`}
                  className="w-76 md:w-166 h-auto rounded-2xl shadow-lg object-contain"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 md:h-96">
            <p className="text-gray-400 text-sm">No images available</p>
          </div>
        )}
      </div>
    </div>
  );
};
