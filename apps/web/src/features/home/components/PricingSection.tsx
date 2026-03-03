import { Sparkles, Layers, FileText } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

import payment_image from "@/assets/landing/ceramic 1.webp";

interface PricingSectionProps {
  onBookClick: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onBookClick,
}) => (
  <section className="px-6 py-12  max-w-7xl mx-auto md:grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className="mb-8 md:mb-0 md:text-center md:max-w-2xl md:mx-auto col-span-1 md:self-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        className="text-3xl md:text-4xl font-serif font-normal text-foreground mb-4 leading-tight"
      >
        How Much You’ll Pay
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        className="text-sm text-gray-500 leading-relaxed"
      >
        Upfront clear contract and agreement for deliverables in order to render
        project as complete or not.
      </motion.p>
    </div>

    <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-8 md:max-w-5xl md:mx-auto col-span-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        whileHover={{
          y: -8,
          boxShadow: "0 25px 50px -12px rgba(98, 139, 53, 0.4)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          backgroundImage: `url(${payment_image})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className=" rounded-[32px] p-8 md:p-10 text-primary-foreground relative overflow-hidden flex flex-col h-[480px] group"
      >
        <motion.div
          className="absolute -right-20 -top-20 w-64 h-64  rounded-full "
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.2, rotate: 90 }}
          transition={{ duration: 0.8 }}
        />
        <h3 className="text-xl md:text-2xl font-normal mb-3 relative z-10">
          Website/Mobile App
        </h3>
        <p className="text-primary-foreground/80 text-xs md:text-sm leading-relaxed mb-8 max-w-[85%] relative z-10">
          Ideal if you want a one-off project with the option for hosting and
          maintenance
        </p>
        <div className="space-y-6 mb-8 relative z-10 tracking-wide">
          <PricingFeature
            icon={
              <Sparkles
                className="text-primary-foreground flex-shrink-0"
                size={20}
              />
            }
            text="Conversion-optimized, animated website/application with hosting and maintenance"
            textColor="text-primary-foreground font-light"
          />
          <PricingFeature
            icon={
              <Layers
                className="text-primary-foreground flex-shrink-0"
                size={20}
              />
            }
            text="Brand guidelines + design system included"
            textColor="text-primary-foreground font-light"
          />
          <PricingFeature
            icon={
              <FileText
                className="text-primary-foreground flex-shrink-0"
                size={20}
              />
            }
            text="Handoff documentation + training"
            textColor="text-primary-foreground font-light"
          />
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 relative z-10">
          <div>
            <div className="text-sm text-primary-foreground/80 mb-1 font-normal">
              Starting at
            </div>
            <div className="text-2xl md:text-3xl font-normal tracking-tight">
              $ 1K
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBookClick}
            className="bg-card text-primary px-14 py-3 md:px-16 md:py-4 rounded-full text-sm font-bold shadow-sm hover:bg-muted transition-colors"
          >
            Book a Call
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        whileHover={{
          y: -8,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
          borderColor: "rgba(98, 139, 53, 0.3)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-muted border border-border rounded-[32px] p-8 md:p-10 relative overflow-hidden flex flex-col h-[400px] md:h-[480px] group"
      >
        <motion.div className="absolute -left-10 -bottom-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <h3 className="text-xl md:text-2xl font-medium mb-3 text-foreground relative z-10">
          Branding + Website/Mobile App
        </h3>
        <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-8 max-w-[90%] relative z-10">
          Perfect if you need ongoing design support for social media posts
        </p>
        <div className="space-y-6 mb-8 relative z-10">
          <PricingFeature
            icon={<Sparkles className="text-primary flex-shrink-0" size={20} />}
            text="1x dedicated designer + PM"
            textColor="text-gray-600"
          />
          <PricingFeature
            icon={<Layers className="text-primary flex-shrink-0" size={20} />}
            text="Graphics + motion design"
            textColor="text-gray-600"
          />
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 relative z-10">
          <div>
            <div className="text-sm  mb-1 font-normal text-gray-500">
              Starting at
            </div>
            <div className="text-2xl md:text-3xl font-normal text-foreground tracking-tight">
              $ 1.5K
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBookClick}
            className="bg-primary text-primary-foreground  px-14 py-3 md:px-16 md:py-4 rounded-full text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors"
          >
            Book a Call
          </motion.button>
        </div>
      </motion.div>
    </div>
  </section>
);

const PricingFeature: React.FC<{
  icon: React.ReactNode;
  text: string;
  textColor: string;
}> = ({ icon, text, textColor }) => (
  <div className="flex items-start  gap-3">
    <div className="mt-0.5">{icon}</div>
    <span className={`text-sm leading-relaxed ${textColor} font-extralight`}>
      {text}
    </span>
  </div>
);
