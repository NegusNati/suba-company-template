import React from "react";

import trininty from "@/assets/landing/trininty.svg";
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";
import { ProgressiveBlur } from "@/components/motion-primitives/progressive-blur";
import { cn } from "@/lib/utils";

export type LogoCloudPartner = {
  label: string;
  logo: string | React.ReactNode;
};

type LogoCloudProps = {
  headline?: string;
  partners?: LogoCloudPartner[];
  className?: string;
  gap?: number;
};

const defaultPartners: LogoCloudPartner[] = [
  {
    label: "Nvidia",
    logo: "https://html.tailus.io/blocks/customers/nvidia.svg",
  },
  {
    label: "Column",
    logo: "https://html.tailus.io/blocks/customers/column.svg",
  },
  {
    label: "GitHub",
    logo: "https://html.tailus.io/blocks/customers/github.svg",
  },
  {
    label: "Nike",
    logo: "https://html.tailus.io/blocks/customers/nike.svg",
  },
  {
    label: "Lemon Squeezy",
    logo: "https://html.tailus.io/blocks/customers/lemonsqueezy.svg",
  },
  {
    label: "Laravel",
    logo: "https://html.tailus.io/blocks/customers/laravel.svg",
  },
  {
    label: "Lilly",
    logo: "https://html.tailus.io/blocks/customers/lilly.svg",
  },
  {
    label: "OpenAI",
    logo: "https://html.tailus.io/blocks/customers/openai.svg",
  },
];

const renderLogo = (partner: LogoCloudPartner) => {
  if (typeof partner.logo === "string") {
    return (
      <img
        className="h-full w-auto object-contain dark:invert"
        src={partner.logo}
        alt={`${partner.label} logo`}
      />
    );
  }

  return partner.logo;
};

export const LogoCloud: React.FC<LogoCloudProps> = ({
  headline = "Powering the best teams",
  partners = defaultPartners,
  className,
  gap = 112,
}) => {
  return (
    <section className={cn("bg-background pb-16 md:pb-32", className)}>
      <div className="group relative m-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-6">
          <div className="inline md:max-w-44">
            <p className="text-end text-sm text-muted-foreground">{headline}</p>
          </div>
          <div className="relative py-6 md:w-[calc(100%-11rem)]">
            <InfiniteSlider speedOnHover={20} speed={24} gap={gap}>
              {partners.map((partner) => (
                <>
                  <div key={partner.label} className="flex ">
                    <div className=" flex items-center justify-center ">
                      <div className="flex items-center h-12 justify-center overflow-hidden rounded-lg mx-8 py-1 bg-blur-md ">
                        {renderLogo(partner)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <img src={trininty} alt="Trininty" className="h-6 w-auto" />
                  </div>
                </>
              ))}
            </InfiniteSlider>

            <ProgressiveBlur
              className="pointer-events-none absolute left-0 top-1/2 h-1/2 w-15 -translate-y-1/2"
              direction="left"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
