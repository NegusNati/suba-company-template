import { PlusCircle, MinusCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

import growthSvg from "@/assets/about-us/growth.svg";
import somaliSvg from "@/assets/about-us/somali.svg";
import speedSvg from "@/assets/about-us/speed.svg";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

interface ProblemCard {
  id: number;
  problem: string;
  solution: string;
}

const problemCards: ProblemCard[] = [
  {
    id: 1,
    problem:
      "User experience was treated as an afterthought. Accessibility wasn't prioritized",
    solution: "Offer magical user experiences that encourage adoption",
  },
  {
    id: 2,
    problem:
      "Business workflows were not accurately translated into the product",
    solution:
      "Deep dive into business processes to create accurate digital representations",
  },
  {
    id: 3,
    problem:
      "Technical debt accumulated faster than features could be delivered",
    solution: "Build scalable architectures that grow with your business needs",
  },
];

interface ExpandableCardProps {
  card: ProblemCard;
  isExpanded: boolean;
  onToggle: () => void;
}

const ExpandableCard = ({
  card,
  isExpanded,
  onToggle,
}: ExpandableCardProps) => {
  return (
    <div className="cursor-pointer self-start" onClick={onToggle}>
      {/* Problem Card (White/Light background) */}
      <div className="relative">
        <div
          className={`bg-card rounded-2xl p-5 flex items-start justify-between gap-3 border border-border/30 shadow-sm transition-all duration-300 ${
            isExpanded ? "rounded-b-none border-b-primary" : ""
          }`}
        >
          {/* Number */}
          <span className="text-3xl md:text-4xl font-serif text-muted-foreground/30 leading-none font-light">
            {card.id}
          </span>

          {/* Problem text */}
          <p className="text-sm md:text-base text-foreground leading-relaxed flex-1 pt-1">
            {card.problem}
          </p>

          {/* Toggle button */}
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 mt-1"
          >
            {isExpanded ? (
              <MinusCircle className="w-5 h-5 text-primary" />
            ) : (
              <PlusCircle className="w-5 h-5 text-muted-foreground/50 hover:text-primary transition-colors" />
            )}
          </motion.div>
        </div>

        {/* Green accent bar visible when collapsed (hint that there's more) */}
        {!isExpanded && (
          <div className="absolute -bottom-1 left-4 right-4 h-1.5 bg-primary/60 rounded-b-full" />
        )}
      </div>

      {/* Solution Card (Green background) - Animated expansion */}
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            key={`solution-${card.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.2 },
            }}
            className="overflow-hidden"
          >
            <div className="bg-primary rounded-2xl rounded-t-none p-5 pt-4">
              <p className="text-xs text-primary-foreground/70 mb-1 font-medium">
                Our Solution
              </p>
              <p className="text-sm md:text-base text-primary-foreground leading-relaxed">
                {card.solution}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const OurStory = () => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  };

  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="px-6 md:px-12 lg:px-20 py-16 md:py-24"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-md mb-12 md:mb-16">
          <motion.h2
            variants={item}
            className="text-3xl md:text-4xl font-serif font-medium text-foreground mb-4 leading-tight tracking-tight"
          >
            Our Story
          </motion.h2>
          <motion.p
            variants={item}
            className="text-sm md:text-base text-muted-foreground leading-relaxed"
          >
            After years of building products across a wide range of
            industries—startups, government platforms, logistics systems,
            enterprise applications—we discovered a recurring problem: a
            persistent disconnect between business goals and the final digital
            product.
          </motion.p>
        </div>

        {/* Problem Cards Row */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16 items-start"
        >
          {problemCards.map((card) => (
            <ExpandableCard
              key={card.id}
              card={card}
              isExpanded={expandedCard === card.id}
              onToggle={() => handleToggle(card.id)}
            />
          ))}
        </motion.div>

        {/* Insight Cards Row */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
        >
          {/* Speed Card */}
          <div className="bg-muted/30 rounded-3xl p-6 flex flex-col items-center text-center border border-border/20 overflow-hidden">
            <div className="w-full h-32 md:h-40 flex items-center justify-center mb-4">
              <img
                src={speedSvg}
                alt="Speed gauge illustration"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-sm md:text-base text-foreground font-medium leading-snug">
              Your users want things fast, simple,
              <br />
              and intuitive
            </p>
          </div>

          {/* Growth Card */}
          <div className="bg-muted/30 rounded-3xl p-6 flex flex-col items-center text-center border border-border/20 overflow-hidden">
            <div className="w-full h-32 md:h-40 flex items-center justify-center mb-4">
              <img
                src={growthSvg}
                alt="Growth chart illustration"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-sm md:text-base text-foreground font-medium leading-snug">
              Your business needs stability,
              <br />
              accuracy, and long-term value
            </p>
          </div>

          {/* Purpose Card */}
          <div className="flex flex-col gap-4 justify-around py-6">
            {/* Cross icon */}
            <div className="flex justify-center md:justify-start">
              <div className="w-16 h-16 md:w-20 md:h-20">
                <img
                  src={somaliSvg}
                  alt="Somali decorative icon"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Text */}
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-center md:text-left">
              So we built a company with the purpose to bridge the gap between
              business requirements and user expectations—and deliver software
              that produces measurable impact.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
