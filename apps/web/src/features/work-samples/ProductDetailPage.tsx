import { useRouter } from "@tanstack/react-router";
import React from "react";

import {
  ContentSection,
  WorkSampleDetailHero,
  WorkSamplesGallery,
} from "./components";

import type { PublicProductDetail } from "@/lib/products";

interface ProductDetailPageProps {
  product: PublicProductDetail;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
}) => {
  const router = useRouter();

  const handleBack = () => router.navigate({ to: "/projects" as never });

  // Convert product images to gallery format
  const galleryImages = product.images.map((img) => ({
    id: img.id,
    imageUrl: img.imageUrl,
    position: img.position,
  }));

  return (
    <div className="w-full  min-h-screen pb-20">
      <div className="px-6 py-8 max-w-5xl mx-auto">
        {/* Hero Section - Centered Title with Tags */}
        <WorkSampleDetailHero
          title={product.title}
          tags={product.tags}
          externalLink={product.productLink}
        />

        {/* Work Samples Gallery */}
        {galleryImages.length > 0 && (
          <WorkSamplesGallery
            images={galleryImages}
            title={product.title}
            onBack={handleBack}
          />
        )}

        {/* Overview Section */}
        <ContentSection title="Overview" content={product.overview} />

        {/* Description Section */}
        {product.description && (
          <ContentSection title="Description" content={product.description} />
        )}
      </div>
    </div>
  );
};
