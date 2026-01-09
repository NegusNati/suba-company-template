import { Outlet } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { MenuPage } from "./layout/Menu";
import { useLandingNavigation } from "./navigation/useLandingNavigation";

export const LandingGateway: React.FC = () => {
  const { pathname } = useLandingNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-foreground flex flex-col">
      <Header onMenuClick={toggleMenu} isMenuOpen={isMenuOpen} />

      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30 top-16 bg-background"
          >
            <MenuPage onClose={closeMenu} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simple page content without complex animations */}
      <main className="flex-1">
        <Outlet />
      </main>

      {!isMenuOpen && <Footer />}
    </div>
  );
};

export default LandingGateway;
