import { Link } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";

import faqWomen from "../../../assets/landing/faq_women.webp";

import { AppImage } from "@/components/common/AppImage";
import { Button } from "@/components/ui/button";
import { useFaqListQuery } from "@/lib/faq/faq-query";

export const FaqSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { data: response } = useFaqListQuery({ limit: 10 });

  const faqs = response?.data || [];

  if (faqs.length === 0) {
    return null; // Or handle empty state appropriately
  }

  return (
    <section className="px-6 py-12 md:py-24 max-w-7xl mx-auto content-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        {/* Left Column: Title and CTA */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-3xl md:text-4xl font-serif font-normal text-foreground leading-tight my-4 md:max-w-sm"
          >
            Frequently Asked Questions
          </motion.h2>

          <div className="bg-[#F3F6F1] rounded-[32px]  relative overflow-hidden mt-6 md:mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 items-start relative z-10">
              <div className="w-full h-48 relative ">
                <AppImage
                  src={faqWomen}
                  alt="Support"
                  className="object-contain object-bottom w-full h-full"
                />
              </div>
              <div className="p-4 space-y-4">
                <p className="text-xl md:text-xl font-serif text-foreground  leading-snug">
                  Still have question? Need more inquires don't be shy to reach
                  out to us
                </p>
                <Button
                  asChild
                  className="bg-[#6A8D39] hover:bg-[#5a7a30] text-white px-8 py-3 rounded-full text-sm font-medium transition-colors"
                >
                  <Link
                    to="/demo/contact"
                    onClick={() =>
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      })
                    }
                  >
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: FAQ List */}
        <div className="lg:col-span-6  space-y-0">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="border-b border-gray-200 last:border-0"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full py-8 flex items-start justify-between text-left group"
              >
                <span className="font-serif text-lg md:text-xl font-medium text-foreground pr-8 leading-snug">
                  {faq.question}
                </span>
                <span className="flex-shrink-0 pt-1 text-gray-400 group-hover:text-foreground transition-colors">
                  {openFaq === index ? (
                    <Minus size={24} strokeWidth={1.5} />
                  ) : (
                    <Plus size={24} strokeWidth={1.5} />
                  )}
                </span>
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="text-base text-gray-600 leading-relaxed pb-8 pr-8">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
