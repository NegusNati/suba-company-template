import { ChevronDown, Instagram, Linkedin, X } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

import { Button } from "../components/Button";
import { landingSocials } from "../navigation/config";
import { useLandingNavigation } from "../navigation/useLandingNavigation";

import google_meet_logo from "@/assets/external-company-logos/google-meet.svg";
import { AppImage } from "@/components/common/AppImage";

interface MenuProps {
  onClose: () => void;
}

export const MenuPage: React.FC<MenuProps> = ({ onClose }) => {
  const { navItems, ctas, navigateTo } = useLandingNavigation();
  const primaryCta = ctas[0];

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex-1 px-6 py-8 space-y-6">
        {/* Nav Links */}
        <nav className="space-y-4">
          {navItems.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <button
                onClick={() => {
                  navigateTo(item.page);
                  if (item.page !== "home") onClose();
                }}
                className="flex items-center justify-between w-full py-2 text-left group"
              >
                <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {item.label}
                </span>
                {item.hasSubmenu && (
                  <ChevronDown size={20} className="text-gray-400" />
                )}
              </button>
            </motion.div>
          ))}
        </nav>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-8 flex gap-4"
        >
          {primaryCta && (
            <Button
              variant="primary"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-12 pl-1.5 pr-4 justify-start gap-3 shadow-lg shadow-primary/20"
              onClick={() => {
                navigateTo(primaryCta.page);
                onClose();
              }}
            >
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <AppImage
                  src={google_meet_logo}
                  alt="Meet"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <span className="font-medium text-sm">{primaryCta.label}</span>
            </Button>
          )}

          <button className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors border border-primary/20">
            {/* Figma Icon Placeholder - simplified F shape */}
            <svg
              width="14"
              height="21"
              viewBox="0 0 14 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.5 21C1.567 21 0 19.433 0 17.5C0 15.567 1.567 14 3.5 14H7V21H3.5Z"
                fill="#0ACF83"
              />
              <path
                d="M0 10.5C0 8.567 1.567 7 3.5 7H7V14H3.5C1.567 14 0 12.433 0 10.5Z"
                fill="#A259FF"
              />
              <path
                d="M0 3.5C0 1.567 1.567 0 3.5 0H7V7H3.5C1.567 7 0 5.433 0 3.5Z"
                fill="#F24E1E"
              />
              <path
                d="M7 0H10.5C12.433 0 14 1.567 14 3.5C14 5.433 12.433 7 10.5 7H7V0Z"
                fill="#FF7262"
              />
              <path
                d="M14 10.5C14 12.433 12.433 14 10.5 14C8.567 14 7 12.433 7 10.5C7 8.567 8.567 7 10.5 7C12.433 7 14 8.567 14 10.5Z"
                fill="#1ABCFE"
              />
            </svg>
          </button>
        </motion.div>

        {/* Footer Socials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-auto pt-12 absolute bottom-8 left-6 right-6"
        >
          <p className="text-xs font-medium text-foreground mb-4">Follow Us</p>
          <div className="space-y-3">
            {landingSocials.map((social) => {
              const Icon = (() => {
                switch (social.id) {
                  case "linkedin":
                    return Linkedin;
                  case "instagram":
                    return Instagram;
                  case "x":
                  default:
                    return X;
                }
              })();

              return (
                <a
                  key={social.id}
                  href={social.url}
                  className="flex items-center gap-3 text-gray-500 text-xs hover:text-primary transition-colors group"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Icon
                    size={16}
                    className="text-gray-400 group-hover:text-primary"
                  />
                  <span>{social.label}</span>
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
