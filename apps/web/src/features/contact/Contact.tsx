import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion, type Variants } from "motion/react";
import React from "react";

import { ContactFormCard, ContactHero, ContactInfoPanel } from "./components";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Dotted Background + Lion */}
      <ContactHero />

      {/* Main Card - Overlaps the hero section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        className="relative z-10 -mt-16 md:-mt-20 max-w-5xl mx-auto px-4 md:px-6 pb-20"
      >
        <div className="bg-card rounded-2xl shadow-sm shadow-muted overflow-hidden">
          {/* Desktop: Two columns with vertical divider */}
          {/* Mobile: Single column stacked layout */}
          <div className="flex flex-col md:grid md:grid-cols-[minmax(280px,1fr)_1px_1.5fr]">
            {/* Info Panel */}
            <div className="p-6 md:p-10">
              <ContactInfoPanel />
            </div>

            {/* Divider */}
            {/* Desktop: Vertical divider */}
            <div className="hidden md:block bg-border" />
            {/* Mobile: Horizontal divider */}
            <div className="md:hidden h-px bg-border mx-6" />

            {/* Form Panel */}
            <div className="p-6 md:p-10">
              <ContactFormCard />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Book a Call Link */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-center gap-2 pt-4"
      >
        <span className="text-sm text-muted-foreground">Or book a call</span>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <Link
          to="/demo/schedule"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="text-sm font-medium text-primary hover:underline underline-offset-4 decoration-primary/30"
        >
          Book a Call
        </Link>
      </motion.div>
    </div>
  );
};
