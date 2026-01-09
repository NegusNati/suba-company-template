import { motion, useAnimationControls } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface ReadingProgressIndicatorProps {
  targetRef: React.RefObject<HTMLElement | null>;
}

const LINE_SPACING = 16; // px between lines
const MIN_LINES = 12;
const MAX_LINES = 30;
const CONTENT_PER_LINE = 50; // px of content per line

export const ReadingProgressIndicator: React.FC<
  ReadingProgressIndicatorProps
> = ({ targetRef }) => {
  const [lineCount, setLineCount] = useState(MIN_LINES);
  const [, setCurrentLineIndex] = useState(0);
  const [passedLines, setPassedLines] = useState<Set<number>>(new Set());
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const ballControls = useAnimationControls();
  const prevLineIndexRef = useRef(0);
  const isBouncingRef = useRef(false);

  // Calculate dynamic line count based on content height
  useEffect(() => {
    const calculateLines = () => {
      const element = targetRef.current;
      if (!element) return;

      const contentHeight = element.offsetHeight;
      const calculatedLines = Math.ceil(contentHeight / CONTENT_PER_LINE);
      setLineCount(Math.max(MIN_LINES, Math.min(MAX_LINES, calculatedLines)));
    };

    calculateLines();

    const resizeObserver = new ResizeObserver(calculateLines);
    if (targetRef.current) {
      resizeObserver.observe(targetRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [targetRef]);

  // Animate ball drop with tilt effect
  const animateBallDrop = useCallback(
    async (fromLine: number, toLine: number) => {
      // If bouncing currently or trying to animate to the same line, just stop
      if (isBouncingRef.current || fromLine === toLine) return;

      const direction = toLine > fromLine ? 1 : -1;
      const isDropping = direction === 1;

      // Calculate Y positions
      // The ball starts at line 0, which is at y=0.
      // Each line is spaced by (LINE_SPACING + 2)
      const toY = toLine * (LINE_SPACING + 2);

      if (isDropping) {
        // Dropping down sequence:
        // 1. Tilt (rotate)
        // 2. Roll off (move X)
        // 3. Drop (move Y)
        // 4. Land (reset rotation and X)

        // 1. Tilt & Roll slightly
        await ballControls.start({
          rotate: 90,
          x: 12, // Roll off to the right
          transition: {
            duration: 0.15,
            ease: "easeIn",
          },
        });

        // 2. Drop to the next level while maintaining X
        // We do this quickly
        await ballControls.start({
          y: toY,
          transition: {
            duration: 0.1,
            ease: "linear", // Gravity feel
          },
        });

        // 3. Land & Roll back/Reset
        await ballControls.start({
          rotate: 0,
          x: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
          },
        });
      } else {
        // Moving up (scrolling up)
        // Reverse sequence roughly

        // 1. Prepare to jump up (squash/tilt)
        await ballControls.start({
          rotate: -90,
          x: 12,
          transition: { duration: 0.1 },
        });

        // 2. Move Y up
        await ballControls.start({
          y: toY,
          transition: {
            duration: 0.1,
            ease: "linear",
          },
        });

        // 3. Land back on line
        await ballControls.start({
          rotate: 0,
          x: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
          },
        });
      }
    },
    [ballControls],
  );

  // Bounce animation when reaching the end
  const animateBounce = useCallback(async () => {
    if (isBouncingRef.current) return;
    isBouncingRef.current = true;

    const finalY = (lineCount - 1) * (LINE_SPACING + 2);

    // Initial position ensure
    ballControls.set({ y: finalY, x: 0, rotate: 0 });

    // Bounce sequence
    await ballControls.start({
      y: [finalY, finalY - 20, finalY, finalY - 10, finalY],
      transition: {
        duration: 0.6,
        times: [0, 0.3, 0.5, 0.75, 1],
        ease: "easeOut",
      },
    });

    isBouncingRef.current = false;
  }, [ballControls, lineCount]);

  // Handle scroll and calculate progress
  useEffect(() => {
    const handleScroll = () => {
      const element = targetRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      // Calculate progress: 0% when content top enters viewport, 100% when content bottom exits
      const viewportHeight = window.innerHeight;

      // We want to track reading progress.
      // 0% -> Top of blog post is at top of viewport (or slightly below header)
      // 100% -> Bottom of blog post is at bottom of viewport

      // elementTop is distance from top of viewport to top of element.
      // At start: elementTop is roughly positive (header height).
      // At end: elementBottom is roughly viewportHeight.
      // elementBottom = elementTop + elementHeight.

      const startOffset = viewportHeight * 0.2; // Start a bit early? No, start when reading starts.
      // simple progress:
      const scrolled = -rect.top + startOffset;
      const totalScrollable = rect.height - viewportHeight * 0.5; // Adjust denominator to tune sensitivity

      let progress = (scrolled / totalScrollable) * 100;
      progress = Math.max(0, Math.min(100, progress));

      // Map progress to line index
      const targetLineIndex = Math.min(
        Math.floor((progress / 100) * lineCount),
        lineCount - 1,
      );

      const prevLineIndex = prevLineIndexRef.current;

      // Trigger bounce if at VERY end
      if (progress >= 99 && !hasReachedEnd) {
        setHasReachedEnd(true);
        animateBounce();
      } else if (progress < 95) {
        setHasReachedEnd(false);
      }

      if (targetLineIndex !== prevLineIndex) {
        // Animate the ball
        animateBallDrop(prevLineIndex, targetLineIndex);

        // Update passed lines state
        // We set passed lines up to the target index
        const newPassedLines = new Set<number>();
        for (let i = 0; i < targetLineIndex; i++) {
          newPassedLines.add(i);
        }
        setPassedLines(newPassedLines);

        setCurrentLineIndex(targetLineIndex);
        prevLineIndexRef.current = targetLineIndex;
      }
    };

    // Throttle scroll handler for performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, [targetRef, lineCount, animateBallDrop, animateBounce, hasReachedEnd]);

  // Initial setup
  useEffect(() => {
    // Ensure starting position
    ballControls.set({ y: 0, x: 0, rotate: 0 });
  }, [ballControls]);

  return (
    <div className="hidden md:flex flex-col items-center absolute -left-12 lg:-left-16 top-0 h-full pointer-events-none">
      <div className="sticky top-[20vh] flex flex-col items-center">
        {/* Lines and Ball Container */}
        <div className="relative flex flex-col items-center gap-0">
          {/* Lines */}
          {Array.from({ length: lineCount }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 1 }}
              animate={{
                opacity: passedLines.has(index) ? 0.3 : 1,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-8 bg-primary/40 rounded-full last:mb-0"
              style={{
                height: 2,
                marginBottom: LINE_SPACING,
              }}
            />
          ))}

          {/* Ball */}
          <motion.div
            animate={ballControls}
            className="absolute w-4 h-4 bg-primary rounded-full shadow-sm z-10"
            style={{
              top: -((4 - 2) / 2) - 3,
              left: "50%",
              marginLeft: -8, // Center the ball (half of 16px width)
              marginTop: -16, // Position ball to sit on top of line
            }}
          />
        </div>
      </div>
    </div>
  );
};
