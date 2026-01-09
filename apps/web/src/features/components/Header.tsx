import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

import { useLandingNavigation } from "../navigation/useLandingNavigation";

import googleMeetLogo from "@/assets/external-company-logos/google-meet.svg";
import { Button } from "@/components/ui/button";
import { useScrolled } from "@/hooks/useScrolled";
import { landingPagePaths } from "@/types/navigation";

interface HeaderProps {
  onMenuClick: () => void;
  isMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, isMenuOpen }) => {
  const { navItems, ctas, pathname } = useLandingNavigation();
  const primaryCta = ctas[0];
  const isScrolled = useScrolled(50);

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <motion.header
      className="sticky top-0 z-40 w-full  backdrop-blur-md"
      animate={{
        boxShadow: isScrolled
          ? "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
          : "none",
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
        {/* Logo - SUBA.ET */}
        <Link
          to="/"
          className="flex items-center gap-2 cursor-pointer"
          onClick={handleScrollTop}
        >
          <span className="font-bold text-lg tracking-tight text-primary">
            SUBA.ET
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          {navItems
            .filter((item) => item.page !== "projects")
            .map((item) => (
              <Link
                key={item.page}
                to={item.path}
                className={`hover:text-primary transition-colors ${
                  pathname === item.path ? "text-primary" : ""
                }`}
                activeProps={{ className: "text-primary" }}
                onClick={handleScrollTop}
              >
                {item.label}
              </Link>
            ))}
        </nav>

        {/* Desktop CTA Section - Flips position on scroll */}
        <div className="hidden md:flex items-center gap-4">
          <motion.div
            className="flex items-center gap-4"
            layout
            transition={{
              layout: { duration: 0.2, ease: "easeOut" },
            }}
            style={{
              flexDirection: isScrolled ? "row-reverse" : "row",
            }}
          >
            {/* Pill CTA with Google Meet icon */}
            {primaryCta && (
              <motion.div layout="position" transition={{ duration: 0.2 }}>
                <Button
                  size="sm"
                  className="rounded-full pl-1 pr-4 h-10 gap-2 shadow-sm"
                  asChild
                >
                  <Link
                    to={landingPagePaths[primaryCta.page]}
                    onClick={handleScrollTop}
                  >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <img
                        src={googleMeetLogo}
                        alt="Google Meet"
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <span className="font-medium">{primaryCta.label}</span>
                  </Link>
                </Button>
              </motion.div>
            )}

            {/* Work Samples link */}
            <motion.div layout="position" transition={{ duration: 0.2 }}>
              <Link
                to="/demo/projects"
                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
                onClick={handleScrollTop}
              >
                Work Samples
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Menu Toggle */}
        <Button
          onClick={onMenuClick}
          className="text-gray-600 hover:bg-gray-50 rounded-full transition-colors md:hidden"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>
    </motion.header>
  );
};
