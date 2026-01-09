import React, { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface InfiniteSliderProps {
  children: React.ReactNode;
  speed?: number;
  speedOnHover?: number;
  direction?: "left" | "right";
  gap?: number;
  className?: string;
}

export function InfiniteSlider({
  children,
  speed = 20,
  speedOnHover,
  direction = "left",
  gap = 10,
  className,
}: InfiniteSliderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return;

    const scrollerContent = Array.from(scrollerRef.current.children);

    // Duplicate items to ensure seamless scrolling
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      if (scrollerRef.current) {
        scrollerRef.current.appendChild(duplicatedItem);
      }
    });
  }, []);

  const currentSpeed = isHovered && speedOnHover ? speedOnHover : speed;

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 py-4 w-max flex-nowrap",
          "animate-scroll",
          direction === "right" && "animate-scroll-reverse",
        )}
        style={{
          gap: `${gap}px`,
          animationDuration: `${Math.max(10, 1000 / currentSpeed)}s`, // Adjust logic to match desired speed feel
          animationPlayState: isHovered && !speedOnHover ? "paused" : "running",
        }}
      >
        {children}
      </div>
    </div>
  );
}
