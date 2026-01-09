import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import React from "react";

import CalDotCom from "../../components/common/cal-dot-com";

import KingSvg from "@/assets/schedule/king.svg";
import { PageHero } from "@/components/common/PageHero";

export const Booking: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Dotted Background + King */}
      <PageHero title="Schedule a Call" image={KingSvg} imageAlt="king" />

      {/* Main Card - Overlaps the hero section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        className="relative z-10 -mt-16 md:-mt-20 max-w-5xl mx-auto px-4 md:px-6 pb-20"
      >
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm h-[700px]">
          <CalDotCom />
        </div>

        <div className="flex flex-col gap-4 items-center justify-center mt-8">
          <p>Or</p>
          <Link
            to="/demo/contact"
            onClick={() => window.scrollTo(0, 0)}
            className="underline text-primary hover:text-primary/80 transition-colors"
          >
            Book a services quote
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
