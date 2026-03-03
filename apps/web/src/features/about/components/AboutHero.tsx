import { motion } from "motion/react";

import gambella from "@/assets/about-us/gambella.svg";
import { AppImage } from "@/components/common/AppImage";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
};

export const AboutHero = () => {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="px-6 md:px-12 lg:px-20 pt-8 pb-6 md:pt-12 md:pb-10"
    >
      <div className="max-w-6xl mx-auto">
        {/* Desktop layout: flex row with content left, stats right */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-12">
          {/* Left content */}
          <div className="flex-1 max-w-xl">
            <motion.h1
              variants={item}
              className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4 leading-tight tracking-tight"
            >
              About US
            </motion.h1>
            <motion.p
              variants={item}
              className="text-sm md:text-base text-muted-foreground leading-relaxed"
            >
              We are a team of skilled Developers and Designers with experience
              in building enterprise level systems that work at national level
              to startup projects. Utilizing a wide range of technologies from
              mature frameworks to modern tech stacks including no code
              solutions as well.
            </motion.p>
          </div>

          {/* Right side: decorative icon + stats */}
          <motion.div
            variants={item}
            className="flex items-center gap-6 md:gap-10 lg:gap-12"
          >
            {/* Decorative Icon */}
            <div className="hidden md:flex items-center justify-center">
              <AppImage src={gambella} alt="Gambella" />
            </div>

            {/* Stats */}
            <div className="flex items-start gap-8 md:gap-12">
              {/* Projects stat */}
              <div className="text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-primary leading-none">
                  +14
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground mt-2 max-w-[80px] leading-tight">
                  Clients Projects delivered
                </div>
              </div>

              {/* Years stat */}
              <div className="text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-primary leading-none">
                  +5
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground mt-2 max-w-[80px] leading-tight">
                  Years in the industry
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
