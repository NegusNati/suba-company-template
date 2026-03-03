import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect, useCallback } from "react";

import { landingNavItems, landingSocials } from "../navigation/config";
import { useLandingNavigation } from "../navigation/useLandingNavigation";

import instagramIcon from "@/assets/external-company-logos/socials/insta.svg";
import linkedinIcon from "@/assets/external-company-logos/socials/Linkedin.svg";
import telegramIcon from "@/assets/external-company-logos/socials/tg.svg";
import xIcon from "@/assets/external-company-logos/socials/x.svg";
import footerBg from "@/assets/footer/footer.webp";
import footerMobileBg from "@/assets/footer/footer_mobile.webp";
import { AppImage } from "@/components/common/AppImage";
import { Button } from "@/components/ui/button";

const ROTATE_INTERVAL = 5000; // 10 seconds

const socialIcons = {
  x: xIcon,
  linkedin: linkedinIcon,
  instagram: instagramIcon,
};

export const Footer: React.FC = () => {
  const { navigateTo } = useLandingNavigation();
  const [isHovered, setIsHovered] = useState(false);
  const [showContactNow, setShowContactNow] = useState(false);
  const footerSocials = [
    ...landingSocials.map((social) => ({
      ...social,
      icon: socialIcons[social.id],
    })),
    {
      id: "telegram",
      label: "Telegram",
      url: "#",
      icon: telegramIcon,
    },
  ];

  const toggleText = useCallback(() => {
    setShowContactNow((prev) => !prev);
  }, []);

  // Auto-rotate every 10 seconds when not hovered
  useEffect(() => {
    if (isHovered) return;

    const intervalId = setInterval(() => {
      toggleText();
    }, ROTATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isHovered, toggleText]);

  // Toggle on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    toggleText();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <footer className="relative pt-12  px-6 overflow-hidden mt-auto bg-background pb-90 ">
      {/* Background Image - Desktop */}

      <div className="relative z-10 flex flex-col items-center text-center space-y-8">
        {/* Navigation Links */}
        <div className="w-full border-b border-gray-100 pb-6">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-gray-600">
            {landingNavItems.map((item) => (
              <Button
                key={item.page}
                variant="ghost"
                onClick={() => navigateTo(item.page)}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Animated Brand Name / CTA */}
        <div
          className="py-2 cursor-pointer overflow-hidden relative h-24 md:h-32 flex items-center justify-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => showContactNow && navigateTo("contact")}
        >
          <AnimatePresence mode="wait">
            {showContactNow ? (
              <motion.div
                key="contact"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex items-center gap-4"
              >
                <Button variant="ghost">
                  <Link
                    to="/demo/contact"
                    className="font-bold text-5xl md:text-8xl tracking-tight text-primary hover:text-primary/90 transition-colors"
                  >
                    Contact Now
                  </Link>
                </Button>
                <ArrowUpRight
                  className="w-12 h-12 md:w-16 md:h-16 text-primary"
                  strokeWidth={4}
                />
              </motion.div>
            ) : (
              <motion.h1
                key="brand"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="font-bold text-6xl md:text-8xl tracking-tight text-primary uppercase"
              >
                YOUR COMPANY
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Section: Socials & Copyright */}
        <div className="w-full border-t border-gray-100 pt-8 flex flex-col items-center gap-6">
          {/* Social Media Icons */}
          <div className="flex items-center gap-6 text-gray-400">
            {footerSocials.map((social) => (
              <a
                key={social.id}
                href={social.url}
                className="hover:text-primary transition-colors"
                aria-label={social.label}
                target="_blank"
                rel="noreferrer noopener"
              >
                <AppImage
                  src={social.icon}
                  alt={social.label}
                  className="h-5 w-5"
                  loading="eager"
                />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400">
            © 2025 Your Company, All rights reserved
          </p>
        </div>
      </div>
      <picture className="absolute inset-0 pointer-events-none">
        <source media="(min-width: 768px)" srcSet={footerBg} />
        <AppImage
          src={footerMobileBg}
          alt=""
          aria-hidden
          className="h-full w-full object-cover object-bottom md:translate-y-30"
          fetchPriority="low"
        />
      </picture>
    </footer>
  );
};
