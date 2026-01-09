import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { PartnersSection } from "./PartnersSection";

import sofumer from "@/assets/ethiopian/sofumer.webp";
import google_meet_logo from "@/assets/external-company-logos/google-meet.svg";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onBookClick: () => void;
}

const avatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&h=100",
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
} as Variants;
const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
} as { item: Variants };

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
} as Variants;

export const HeroSection: React.FC<HeroSectionProps> = ({ onBookClick }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Image with Complex Gradient Masks to create the "Mist/Cave" effect */}
      {/* Pushed top down to 30% to clear the header area and focus the cave floor at the bottom */}
      <div className="absolute inset-x-0 bottom-0 top-[20%] md:top-[30%] z-0 pointer-events-none  md:translate-y-10 ">
        {/* Using a canyon image to simulate the rock formations in the design, desaturated and lightened */}
        <img
          src={sofumer}
          alt="Abstract Background"
          className="w-full h-full object-cover object-bottom opacity-90 grayscale brightness-110"
        />
        {/* Heavy white overlay to fade it out */}
        <div className="absolute inset-0 bg-background/50 "></div>

        {/* Gradient masks for smooth edges */}
        <div className="absolute inset-x-0 top-0 h-60 bg-gradient-to-b from-background via-background to-transparent"></div>
        <div className="absolute inset-x-0 top-0 h-50 bg-gradient-to-b from-background via-background/80 to-transparent"></div>
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background via-background to-transparent "></div>
        <div className="absolute inset-x-0 bottom-0 h-50 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background to-transparent"></div>
      </div>
      <motion.section
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        className="px-6 pt-10 pb-6 space-y-6 max-w-7xl mx-auto md:flex md:flex-col md:items-center md:text-center md:pt-24 md:pb-16 relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center mb-42 md:mb-52"
      >
        <AnimatedGroup variants={transitionVariants}>
          <Link
            to="/demo/schedule"
            className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950 z-20"
          >
            <span className="text-foreground text-sm">
              Available Starting on Nov 20
            </span>
            <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

            <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
              <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                <span className="flex size-6">
                  <ArrowRight className="m-auto size-3" />
                </span>
                <span className="flex size-6">
                  <ArrowRight className="m-auto size-3" />
                </span>
              </div>
            </div>
          </Link>
        </AnimatedGroup>

        <motion.h1
          variants={item}
          className="text-[40px] md:text-6xl lg:text-7xl font-serif font-medium text-foreground leading-[1.1] tracking-tight max-w-4xl z-20"
        >
          Modern Solutions for <br className="hidden md:block" />
          Customer Engagement
        </motion.h1>

        <motion.p
          variants={item}
          className="text-gray-500 text-sm md:text-lg leading-relaxed max-w-[95%] md:max-w-2xl"
        >
          Highly customizable components for building modern websites and
          applications that look and feel the way you mean it.
        </motion.p>

        <motion.div variants={item} className="flex items-center gap-3 pt-2">
          <div className="flex -space-x-3">
            {avatars.map((src) => (
              <div key={src} className="relative z-0 hover:z-10 transition-all">
                <img
                  src={src}
                  alt="Client"
                  className="w-12 h-12 rounded-full border-[1.5px] border-background object-cover ring-1 ring-gray-50 z-20"
                />
              </div>
            ))}
            <div className="relative z-12 w-12 h-12 rounded-full bg-gray-100 border-[2.5px] border-white flex items-center justify-center ring-1 ring-gray-50">
              <span className="text-[10px] font-medium text-gray-500">You</span>
            </div>
          </div>
          <span className="text-xs text-primary font-medium">
            Over +10 satisfied clients
          </span>
        </motion.div>

        <motion.div
          variants={item}
          className="flex items-center gap-6 pt-4 z-20"
        >
          <Button
            onClick={onBookClick}
            className="group relative h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full pl-1.5 pr-6 flex items-center gap-3 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
              <img
                src={google_meet_logo}
                className="w-6 h-6 object-contain"
                alt="Meet"
              />
            </div>
            <span className="font-medium text-sm">Book a Call</span>
          </Button>

          <Link to="/demo/projects">
            <Button
              variant="ghost"
              className="text-primary font-medium leading-4  hover:opacity-80 transition-opacity z-20"
            >
              Work Samples
            </Button>
          </Link>
        </motion.div>
      </motion.section>
      {/* Partners Logo */}
      <PartnersSection />
    </div>
  );
};
