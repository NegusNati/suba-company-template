import React from "react";

import {
  AboutHero,
  TechStackSlider,
  OurStory,
  MissionVision,
  TeamSection,
} from "./components";

import afar_k from "@/assets/about-us/afar_k.svg";
import BookACall from "@/components/common/book-a-call";
import { PageHeader } from "@/components/common/PageHeader";

export const About: React.FC = () => (
  <>
    <PageHeader
      image={afar_k}
      imageAlt="afar_k"
      imageClassName="scale-120 md:scale-140 translate-y-[-152px] md:translate-y-[-290px] "
    />

    <div className="w-full bg-background min-h-screen pb-20 md:pb-28">
      <AboutHero />
      <TechStackSlider />
      <OurStory />
      <MissionVision />
      <TeamSection />
      <BookACall />
    </div>
  </>
);
