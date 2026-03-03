import { Anchor } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";

import gedaSilhouette from "@/assets/landing/geda.svg";
import { AppImage } from "@/components/common/AppImage";
import { useTestimonialListQuery } from "@/lib/testimonial/testimonial-query";

export const TestimonialsSection: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { data: response } = useTestimonialListQuery({ limit: 5 });

  const testimonials = response?.data || [];

  if (testimonials.length === 0) {
    return null;
  }

  // Ensure activeTestimonial is within bounds if data changes
  const activeIndex = Math.min(activeTestimonial, testimonials.length - 1);
  const currentTestimonial = testimonials[activeIndex];

  return (
    <section className="px-6 py-16 max-w-7xl mx-auto content-auto">
      {/* Section Header */}
      <div className="mb-12 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-3xl md:text-4xl font-serif italic font-normal text-foreground mb-3 leading-tight"
        >
          Client Success Stories
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-gray-500"
        >
          Here it from our partners.
        </motion.p>
      </div>

      {/* Testimonial Card */}
      <div className="relative md:max-w-4xl md:mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-100 rounded-2xl overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Left Side - Silhouette Image */}
              <div className="hidden md:flex items-end justify-center ] w-[200px] flex-shrink-0">
                <AppImage
                  src={gedaSilhouette}
                  alt="Testimonial silhouette"
                  className="h-full max-h-[280px] object-contain object-bottom"
                />
              </div>

              {/* Right Side - Content */}
              <div className="flex-1 p-8 md:p-10 md:pl-6 flex flex-col justify-between">
                {/* Testimonial Text */}
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                  {currentTestimonial.comment}
                </p>

                {/* Footer - Company Logo & Person Info */}
                <div className="flex items-center gap-4">
                  {/* Company Logo & Name */}
                  <div className="flex items-center gap-2">
                    {currentTestimonial.companyLogoUrl ? (
                      <AppImage
                        src={currentTestimonial.companyLogoUrl}
                        alt={currentTestimonial.companyName}
                        className="h-8 object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full">
                          <Anchor size={16} className="text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                            {currentTestimonial.companyName}
                          </span>
                          {currentTestimonial.partner?.title && (
                            <span className="text-[10px] text-gray-400">
                              {currentTestimonial.partner.title}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vertical Divider */}
                  <div className="w-[1px] h-6 bg-gray-300"></div>

                  {/* Person Name & Title */}
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700">
                      {currentTestimonial.spokePersonName}
                      {currentTestimonial.spokePersonTitle && (
                        <span className="text-gray-500">
                          , {currentTestimonial.spokePersonTitle}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveTestimonial(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === index
                ? "w-10 bg-primary"
                : "w-3 bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
