import { motion } from "motion/react";

import MissionIcon from "@/assets/about-us/mission-target.svg";
import VisionIcon from "@/assets/about-us/vision-bnacular.png";

// Animation variants
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
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0, 0, 0.2, 1] as const,
    },
  },
};

// Types
interface MissionVisionCardData {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconAlt: string;
  variant: "mission" | "vision";
}

// Data
const missionVisionData: MissionVisionCardData[] = [
  {
    id: "mission",
    title: "Our Mission",
    description:
      "Our mission is simple: to maximize value for our clients by designing and building digital solutions that solve real business challenges while elevating the user experience. We create products that make businesses operate smarter and faster, and we obsess over usability so every interaction feels effortless, intuitive, and meaningful. Our goal is to help organizations unlock measurable growth—through software that works beautifully and performs reliably.",
    icon: MissionIcon,
    iconAlt: "Mission target icon",
    variant: "mission",
  },
  {
    id: "vision",
    title: "Vision",
    description:
      "Our vision is to create seamless digital experiences that balance user needs with business requirements. We believe technology should bridge gaps—not create them. That's why we aim to build systems that feel natural to users while supporting the complexity and scalability demanded by modern businesses. Ultimately, we want to shape a future where software is not just functional, but delightful—where every click, flow, and interaction simply makes sense.",
    icon: VisionIcon,
    iconAlt: "Vision binoculars icon",
    variant: "vision",
  },
];

// Reusable Card Component
interface MissionVisionCardProps {
  data: MissionVisionCardData;
}

const MissionVisionCard = ({ data }: MissionVisionCardProps) => {
  return (
    <motion.div
      variants={item}
      className="w-full h-full bg-gray-50 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300"
    >
      {/* Header Section with Green Background */}
      <div className="relative h-48 bg-gradient-to-r from-primary via-primary/95 to-primary/30  overflow-visible">
        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Decorative Curved Line SVG */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
          {data.variant === "mission" ? (
            <svg
              viewBox="0 0 500 200"
              className="w-full h-full absolute top-0 left-0 stroke-white fill-none stroke-[2px]"
              preserveAspectRatio="none"
              style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
            >
              {/* Mission: Smooth wave with a loop */}
              <path d="M-50,140 C50,140 100,40 200,70 C280,100 250,150 220,120 C200,100 250,40 400,70 C500,90 550,50 550,50" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 500 200"
              className="w-full h-full absolute top-0 left-0 stroke-white fill-none stroke-[2px]"
              preserveAspectRatio="none"
              style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
            >
              {/* Vision: Loopy wave */}
              <path d="M-50,110 C100,110 150,40 220,40 C280,40 280,140 220,140 C180,140 200,70 350,70 C450,70 550,90 550,90" />
            </svg>
          )}
        </div>

        {/* Icon Container - Overlapping Boundary */}
        <div className="absolute -top-[-30px] right-10 md:right-16 w-20 h-20 md:w-24 md:h-24 bg-card rounded-full flex items-center justify-center shadow-lg z-20 border-4 border-card">
          <img
            src={data.icon}
            alt={data.iconAlt}
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
          />
          {/* Inner circle border for detail */}
          <div className="absolute inset-1 rounded-full border border-primary/10" />
        </div>
      </div>

      {/* Body Section */}
      <div className="p-8 md:p-10 pt-16 flex flex-col grow relative z-10 bg-gray-50 rounded-t-[2rem] translate-y-[-30px]">
        <h3 className="text-xl md:text-2xl font-serif font-medium text-primary mb-6">
          {data.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
          {data.description}
        </p>
      </div>
    </motion.div>
  );
};

// Main Component
export const MissionVision = () => {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="px-6 md:px-12 lg:px-20 py-16 md:py-24"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {missionVisionData.map((cardData) => (
            <MissionVisionCard key={cardData.id} data={cardData} />
          ))}
        </div>
      </div>
    </motion.section>
  );
};
