import { motion } from "framer-motion";
import React from "react";

import deploymentVisual from "@/assets/landing/workflow/deployment_1_big.gif.mp4";
import designVisual from "@/assets/landing/workflow/design_big.gif.mp4";
import developmentVisual from "@/assets/landing/workflow/development_2_big.gif.mp4";
import discoveryVisual from "@/assets/landing/workflow/discovery call_3_big.gif.mp4";

export const WorkflowSection: React.FC = () => (
  <section className="px-6 py-12 max-w-7xl mx-auto">
    <div className="mb-12 md:text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        className="text-3xl md:text-5xl font-serif font-normal text-foreground mb-4 leading-tight"
      >
        A Work Flow That <br className="md:hidden" /> Keeps You In The Loop
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        className="text-muted-foreground text-sm md:text-base font-light"
      >
        How it goes from first chat to launch
      </motion.p>
    </div>

    <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6">
      <WorkflowStep
        stepNumber="01"
        videoSrc={discoveryVisual}
        title="Discovery Call"
        description="We learn more about your business and find the best solution that fits your needs and budget."
      />
      <WorkflowStep
        stepNumber="02"
        videoSrc={designVisual}
        title="Design, Feedback Loop"
        description="We start working on the design where you are updated on each step and provide feedback."
      />
      <WorkflowStep
        stepNumber="03"
        videoSrc={developmentVisual}
        title="Development"
        description="We start implementing approved designs with industry standards and practices."
      />
      <WorkflowStep
        stepNumber="04"
        videoSrc={deploymentVisual}
        title="Deployment"
        description="Excellent SEO and reliable server with hosting service offer as well with maintenance support."
      />
    </div>
  </section>
);

const WorkflowStep: React.FC<{
  stepNumber: string;
  videoSrc: string;
  title: string;
  description: string;
}> = ({ stepNumber, videoSrc, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5 }}
    className="border border-border/40 rounded-3xl p-6 flex flex-col justify-between h-[420px] hover:border-border/80 transition-colors duration-300"
  >
    <div className="space-y-4">
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-sm  font-extralight text-primary">
        {stepNumber}
      </div>
      <div>
        <h3 className="text-xl font-serif  mb-3 text-card-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>

    <div className="mt-6 -mx-2 rounded-xl overflow-hidden">
      <video
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto object-cover opacity-90 mix-blend-multiply"
      />
    </div>
  </motion.div>
);
