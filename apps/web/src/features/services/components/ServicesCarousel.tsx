import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ServiceCarouselItem {
  id: string | number;
  title: string;
  description: string;
  image: string; // URL for the laptop/screen image
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

interface ServicesCarouselProps {
  items: ServiceCarouselItem[];
  className?: string;
}

export const ServicesCarousel: React.FC<ServicesCarouselProps> = ({
  items,
  className,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!items || items.length === 0) return null;

  return (
    <div className={cn("w-full py-10", className)}>
      <div className="relative group">
        <div className="overflow-hidden rounded-[2rem]" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative flex-[0_0_100%] min-w-0 pl-0"
              >
                {/* Card Container */}
                <div className="relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#628B35] to-transparent/5 h-[500px] md:h-[650px] flex flex-col pt-8 px-6 md:px-12 lg:px-16">
                  {/* Top Section: Content Grid */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-12 relative z-10 w-full mb-8">
                    {/* Left Column: Title */}
                    <div className="w-full md:w-1/2">
                      <h2 className="font-serif text-xl md:text-3xl lg:text-5xl leading-tight text-white">
                        {item.title}
                      </h2>
                    </div>

                    {/* Right Column: Description + Buttons */}
                    <div className="w-full md:w-1/2 md:max-w-md pt-2 md:pt-4">
                      <p className="text-white/90 text-sm md:text-base lg:text-lg mb-8 font-light leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4">
                        {item.ctaText && (
                          <Button
                            className="bg-white text-[#628B35] hover:bg-white/90 hover:text-[#4f7a28] rounded-full px-8 py-6 text-base font-medium shadow-sm transition-all duration-300 transform hover:-translate-y-1"
                            asChild={!!item.ctaLink}
                          >
                            {item.ctaLink ? (
                              <a href={item.ctaLink}>{item.ctaText}</a>
                            ) : (
                              item.ctaText
                            )}
                          </Button>
                        )}

                        {item.secondaryCtaText && (
                          <Button
                            variant="ghost"
                            className="text-white hover:bg-white/10 hover:text-white rounded-full px-6 py-6 text-base font-medium"
                            asChild={!!item.secondaryCtaLink}
                          >
                            {item.secondaryCtaLink ? (
                              <a href={item.secondaryCtaLink}>
                                {item.secondaryCtaText}
                              </a>
                            ) : (
                              item.secondaryCtaText
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section: Image */}
                  <div className="relative flex-1 w-full flex items-end justify-center mt-auto">
                    <div className="relative w-full max-w-6xl mx-auto transform md:translate-y-[5%] transition-transform duration-700 ease-out hover:scale-[1.02]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-auto object-contain drop-shadow-2xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="from-background pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-linear-to-t to-transparent"
          aria-hidden
        />
        {/* Navigation Wrapper - Absolute Overlay */}
        <div className="hidden md:flex absolute bottom-8 right-8 z-20 bg-[#557C2B] rounded-full p-2 items-center gap-2 shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="h-10 w-10 rounded-full text-white hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="h-10 w-10 rounded-full text-white hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <ArrowRight className="h-5 w-5" />
            <span className="sr-only">Next slide</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
