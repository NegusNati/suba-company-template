import { LexicalEditor } from "@rich-text/LexicalEditor";
import { useRouter } from "@tanstack/react-router";
import React from "react";

import { getServiceImageUrl } from "./lib/service-utils";

import { Button } from "@/components/ui/button";
import type { PublicServiceDetail } from "@/lib/services";

interface ServiceDetailPageProps {
  service: PublicServiceDetail;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  service,
}) => {
  const router = useRouter();

  const handleBack = () => router.navigate({ to: "/services" as never });

  const featuredImageUrl = service.images?.[0]?.imageUrl
    ? getServiceImageUrl(service.images[0].imageUrl)
    : null;

  return (
    <div className="w-full bg-white min-h-screen pb-20">
      <div className="px-6 py-8 max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="font-medium">Back to Services</span>
        </button>

        {/* Hero Section */}
        <div className="mb-12">
          {featuredImageUrl && (
            <div className="w-full aspect-video rounded-3xl overflow-hidden mb-8">
              <img
                src={featuredImageUrl}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            {service.title}
          </h1>

          <p className="text-lg text-muted-foreground">{service.slug}</p>
        </div>

        {/* Description Section */}
        {service.description && (
          <div className="mb-12">
            <LexicalEditor
              value={service.description}
              readOnly
              valueFormat="html"
            />
          </div>
        )}

        {/* Images Gallery */}
        {service.images && service.images.length > 1 && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6">Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {service.images.slice(1).map((image, index) => {
                const imageUrl = getServiceImageUrl(image.imageUrl);
                return imageUrl ? (
                  <div
                    key={index}
                    className="aspect-video rounded-2xl overflow-hidden"
                  >
                    <img
                      src={imageUrl}
                      alt={`${service.title} - Image ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-primary/5 rounded-3xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Interested in this service?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Let's discuss how we can help you achieve your goals with our
            expertise.
          </p>
          <Button
            onClick={() => router.navigate({ to: "/schedule" as never })}
            className="px-8 py-6 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            Schedule a Consultation
          </Button>
        </div>
      </div>
    </div>
  );
};
