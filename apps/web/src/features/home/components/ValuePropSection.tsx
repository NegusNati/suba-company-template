import { motion } from "framer-motion";
import React from "react";

import BrandScrollSection from "./logo-scroll/brand-scroll-section";

import trininty from "@/assets/landing/trininty.svg";

export const ValuePropSection: React.FC = () => {
  return (
    <section className="px-6 py-18  max-w-7xl mx-auto">
      <div className="md:grid md:grid-cols-2  md:gap-14 md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-12 md:mb-0"
        >
          <h2 className="text-[28px] md:text-2xl lg:text-4xl font-serif font-normal text-foreground mb-6 leading-tight">
            We will add value and reach to your business using digital solutions
          </h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-lg ">
            We are a team of skilled Developers and Designers with experience in
            building enterprise level systems that work at national level to
            startup projects. Utilizing a wide range of technologies from mature
            frameworks to modern tech stacks including no code solutions as
            well.
          </p>

          <div className="flex justify-between items-start px-4 md:px-0 md:gap-12 md:justify-start">
            <div className="flex self-center items-center md:translate-y-4">
              <img src={trininty} className="w-14 md:w-24" alt="Trininty" />
            </div>
            <div className="text-center md:text-left flex-1 md:flex-none">
              <div className="text-7xl md:text-8xl font-serif font-normal text-primary leading-none mb-2">
                +14
              </div>
              <div className="text-xs text-gray-500 font-medium capitalize tracking-wide ">
                Clients Projects delivered
              </div>
            </div>
            <div className="text-center md:text-left flex-1 md:flex-none">
              <div className="text-7xl md:text-8xl font-serif font-normal text-primary leading-none mb-2">
                +5
              </div>
              <div className="text-xs text-gray-500 font-medium capitalize tracking-wide capitalize">
                Years in the industry
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-4  p-2"
        >
          {/* Right Column: Tech Stack Grid */}
          <div className="relative">
            {/* Faded label */}
            <p className="text-center text-xs text-gray-400 mb-8 uppercase tracking-widest">
              Our tech stack
            </p>

            <BrandScrollSection />

            {/* Background glow/blur effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-green-50/50 blur-3xl -z-10 rounded-full"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
