"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import type { CSSProperties } from "react";

// Default Amharic/Ge'ez character set
const DEFAULT_LETTERS = [
  // Ge'ez alphabet - ha series
  "ሀ",
  "ሁ",
  "ሂ",
  "ሃ",
  "ሄ",
  "ህ",
  "ሆ",
  // le series
  "ለ",
  "ሉ",
  "ሊ",
  "ላ",
  "ሌ",
  "ል",
  "ሎ",
  // ha (ḥa) series
  "ሐ",
  "ሑ",
  "ሒ",
  "ሓ",
  "ሔ",
  "ሕ",
  "ሖ",
  // me series
  "መ",
  "ሙ",
  "ሚ",
  "ማ",
  "ሜ",
  "ም",
  "ሞ",
  // se (ś) series
  "ሠ",
  "ሡ",
  "ሢ",
  "ሣ",
  "ሤ",
  "ሥ",
  "ሦ",
  // re series
  "ረ",
  "ሩ",
  "ሪ",
  "ራ",
  "ሬ",
  "ር",
  "ሮ",
  // se series
  "ሰ",
  "ሱ",
  "ሲ",
  "ሳ",
  "ሴ",
  "ስ",
  "ሶ",
  // we series
  "ወ",
  "ዉ",
  "ዊ",
  "ዋ",
  "ዌ",
  "ው",
  "ዎ",
  // tse (ṣ) series
  "ፀ",
  "ፁ",
  "ፂ",
  "ፃ",
  "ፄ",
  "ፅ",
  "ፆ",
  // Additional common characters
  "አ",
  "ኡ",
  "ኢ",
  "ኣ",
  "ኤ",
  "እ",
  "ኦ",
  "ከ",
  "ኩ",
  "ኪ",
  "ካ",
  "ኬ",
  "ክ",
  "ኮ",
  "ዐ",
  "ዑ",
  "ዒ",
  "ዓ",
  "ዔ",
  "ዕ",
  "ዖ",
  "ተ",
  "ቱ",
  "ቲ",
  "ታ",
  "ቴ",
  "ት",
  "ቶ",
  "ነ",
  "ኑ",
  "ኒ",
  "ና",
  "ኔ",
  "ን",
  "ኖ",
];

export interface AmharicLetterAnimationProps {
  /** Custom array of letters to animate. Defaults to Amharic/Ge'ez characters */
  letters?: string[];
  /** Number of letters to display at once */
  letterCount?: number;
  /** Minimum font size in pixels */
  minSize?: number;
  /** Maximum font size in pixels */
  maxSize?: number;
  /** Minimum animation duration in seconds */
  minDuration?: number;
  /** Maximum animation duration in seconds */
  maxDuration?: number;
  /** Color of the letters (CSS color value) */
  color?: string;
  /** Additional CSS class names for the container */
  className?: string;
  /** Custom inline styles for the container */
  style?: CSSProperties;
}

interface FloatingLetter {
  id: number;
  char: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

/**
 * A reusable animated background component that displays Amharic/Ge'ez
 * characters fading in and out smoothly.
 */
export function AmharicLetterAnimation({
  letters = DEFAULT_LETTERS,
  letterCount = 15,
  minSize = 16,
  maxSize = 48,
  minDuration = 3,
  maxDuration = 8,
  color = "rgb(98 139 53 / 0.06)",
  className = "",
  style,
}: AmharicLetterAnimationProps) {
  const [floatingLetters, setFloatingLetters] = useState<FloatingLetter[]>([]);
  const counterRef = useRef(0);

  // Helper to generate random values
  const random = useCallback((min: number, max: number) => {
    return Math.random() * (max - min) + min;
  }, []);

  // Generate a new floating letter with random properties
  const createLetter = useCallback(
    (id: number): FloatingLetter => {
      return {
        id,
        char: letters[Math.floor(Math.random() * letters.length)],
        x: random(5, 95),
        y: random(5, 95),
        size: random(minSize, maxSize),
        duration: random(minDuration, maxDuration),
        delay: random(0, 2),
      };
    },
    [letters, minSize, maxSize, minDuration, maxDuration, random],
  );

  // Initialize letters on mount
  useEffect(() => {
    const initialLetters = Array.from({ length: letterCount }, (_, i) =>
      createLetter(i),
    );
    setFloatingLetters(initialLetters);
    counterRef.current = letterCount;
  }, [letterCount, createLetter]);

  // Handle letter animation completion - regenerate with new properties
  const handleAnimationComplete = useCallback(
    (id: number) => {
      const newId = counterRef.current;
      counterRef.current += 1;

      setFloatingLetters((prev) =>
        prev.map((letter) =>
          letter.id === id
            ? {
                ...createLetter(newId),
                id: newId,
              }
            : letter,
        ),
      );
    },
    [createLetter],
  );

  // Memoize container styles
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 0,
      ...style,
    }),
    [style],
  );

  return (
    <div className={className} style={containerStyle}>
      <AnimatePresence>
        {floatingLetters.map((letter) => (
          <motion.span
            key={letter.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 1, 0.5],
            }}
            transition={{
              duration: letter.duration,
              delay: letter.delay,
              ease: "easeInOut",
              times: [0, 0.2, 0.8, 1],
            }}
            onAnimationComplete={() => handleAnimationComplete(letter.id)}
            style={{
              position: "absolute",
              left: `${letter.x}%`,
              top: `${letter.y}%`,
              fontSize: `${letter.size}px`,
              color,
              fontFamily: "serif",
              userSelect: "none",
              willChange: "opacity, transform",
            }}
          >
            {letter.char}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default AmharicLetterAnimation;
