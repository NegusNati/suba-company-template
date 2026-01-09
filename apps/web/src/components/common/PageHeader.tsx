import { motion } from "motion/react";

import { DottedBackground } from "./DottedBackground";
import DotGridBackground from "../motion-primitives/dot-grid-background";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title?: string;
  image: string;
  imageAlt?: string;
  imageClassName?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  image,
  imageAlt = "hero image",
  imageClassName,
}) => {
  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Dotted Background Section */}
      <DottedBackground
        className="min-h-[150px] md:min-h-[300px]"
        dotOpacity={0.25}
        dotSpacing={24}
        dotSize={30}
      >
        <div className="px-4 md:px-6 pt-10 md:pt-12 translate-y-[80px] md:translate-y-[152px] z-10">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl md:text-5xl font-serif text-primary tracking-tight"
          >
            {title}
          </motion.h1>
        </div>
      </DottedBackground>

      <DotGridBackground
        rows={14}
        columns={24}
        gap={3}
        dotRadius={0.6}
        minOpacity={0.12}
        maxOpacity={0.4}
        className="translate-y-[-10px] z-0 "
      />

      {/* Hero Image - Centered and overlapping the card */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div
          className={cn(
            "relative h-full max-w-5xl mx-auto translate-y-[-102px] md:translate-y-[-122px] ",
            imageClassName,
          )}
        >
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            src={image}
            alt={imageAlt}
            aria-hidden="true"
            className="absolute left-1/2 translate-x-[-28%] md:translate-x-2/8 bottom-[-72px] md:bottom-[-96px] w-[200px] md:w-[320px] lg:w-[360px] text-primary/80 select-none"
            style={{ filter: "opacity(0.85)" }}
          />
        </div>
      </div>
    </div>
  );
};
