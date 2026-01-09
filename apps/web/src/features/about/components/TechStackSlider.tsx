import { motion } from "motion/react";

import { BrandLogo } from "@/features/home/components/logo-scroll/brand-logo";
import { BrandMarquee } from "@/features/home/components/logo-scroll/brand-marquee";

// Brand data for two rows
const brandsRow1 = [
  "adobe",
  "ae",
  "ai",
  "amznwebserv",
  "analytics",
  "algolia",
  "android",
  "anthropic",
  "astro",
  "atom",
  "aws",
  "azure",
  "bedrock",
  "bunjs",
  "canva",
  "chakraui",
  "claude",
  "cloudflare",
  "css3",
  "dart",
  "digitalocean",
  "django",
  "docker",
];

const brandsRow2 = [
  "docker",
  "exa",
  "expressjs",
  "figma",
  "firebase",
  "flask",
  "flutter",
  "framer",
  "gcloud",
  "gemini",
  "git",
  "github",
  "gitlab",
  "grafana",
  "html5",
  "huggingface",
  "hunyuan",
  "id",
  "insomnia",
  "kotlin",
  "kubernetes",
  "langchain",
  "laravel",
  "lightroom",
];

export const TechStackSlider = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="py-6 md:py-10 overflow-hidden"
    >
      <div className="flex flex-col gap-4">
        {/* Row 1 - scrolling left */}
        <BrandMarquee duration={40} delay={0}>
          {brandsRow1.map((brand, i) => (
            <BrandLogo key={`row1-${i}`} icon={brand} />
          ))}
        </BrandMarquee>

        {/* Row 2 - scrolling right (reverse) */}
        <BrandMarquee duration={48} reverse delay={0}>
          {brandsRow2.map((brand, i) => (
            <BrandLogo key={`row2-${i}`} icon={brand} />
          ))}
        </BrandMarquee>
      </div>
    </motion.section>
  );
};
