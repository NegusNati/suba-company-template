import { motion } from "motion/react";
import type { ReactNode } from "react";

interface BrandMarqueeProps {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  delay?: number;
}

export function BrandMarquee({
  children,
  duration = 30,
  reverse = false,
  delay = 0,
}: BrandMarqueeProps) {
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        className="flex gap-6 pr-6"
        initial={{ x: reverse ? "-50%" : "0%" }}
        animate={{ x: reverse ? "0%" : "-50%" }}
        transition={{
          duration,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
          delay,
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
