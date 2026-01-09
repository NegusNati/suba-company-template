import React from "react";

import { ContactCTASection } from "./components/ContactCTASection";
import { FaqSection } from "./components/FaqSection";
import { HeroSection } from "./components/HeroSection";
import { PricingSection } from "./components/PricingSection";
import ServicesSection from "./components/ServicesSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { ValuePropSection } from "./components/ValuePropSection";
import { WorkflowSection } from "./components/WorkflowSection";
import { WorkSamplesSection } from "./components/WorkSamplesSection";

export interface HomeProps {
  onBookClick: () => void;
}

export const Home: React.FC<HomeProps> = ({ onBookClick }) => {
  return (
    <div className="w-full bg-background pb-20">
      <HeroSection onBookClick={onBookClick} />
      {/* <PartnersSection /> */}
      <ValuePropSection />
      <ServicesSection />
      <WorkflowSection />
      <PricingSection onBookClick={onBookClick} />
      <TestimonialsSection />
      <FaqSection />
      <WorkSamplesSection />
      <ContactCTASection />
    </div>
  );
};
