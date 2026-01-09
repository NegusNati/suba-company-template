import { useState, useEffect } from "react";

/**
 * Hook that returns true when the page has been scrolled past a threshold
 * @param threshold - The scroll position threshold in pixels (default: 50)
 * @returns boolean indicating if scrolled past threshold
 */
export function useScrolled(threshold: number = 50): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > threshold;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold, isScrolled]);

  return isScrolled;
}
