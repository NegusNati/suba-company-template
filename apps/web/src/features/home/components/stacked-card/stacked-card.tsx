import type { Variants } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";

interface StackedCardCarouselProps {
  children: React.ReactNode[];
  autoRotate?: boolean;
  interval?: number;
  containerClassName?: string;
}

const StackedCardCarousel: React.FC<StackedCardCarouselProps> = ({
  children,
  autoRotate = true,
  interval = 4000,
  containerClassName = "w-[240px] h-[480px]", // Default to phone size
}) => {
  const [cards, setCards] = useState(React.Children.toArray(children));

  const moveToEnd = (fromIndex: number) => {
    setCards((currentCards) => {
      const newCards = [...currentCards];
      const item = newCards.splice(fromIndex, 1)[0];
      newCards.push(item);
      return newCards;
    });
  };

  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      moveToEnd(0);
    }, interval);
    return () => clearInterval(timer);
  }, [autoRotate, interval]);

  const cardVariants: Variants = {
    front: {
      x: "0%",
      y: "0%",
      scale: 1,
      zIndex: 3,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    middle: {
      x: "-10%", // Reduced offset for cleaner stack
      y: "-8%",
      scale: 0.95,
      zIndex: 2,
      opacity: 0.7,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    back: {
      x: "-20%",
      y: "-16%",
      scale: 0.9,
      zIndex: 1,
      opacity: 0.4,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    hidden: {
      x: "-30%",
      y: "-24%",
      scale: 0.85,
      zIndex: 0,
      opacity: 0,
    },
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000 py-8">
      <div className={`relative ${containerClassName}`}>
        <AnimatePresence initial={false} mode="popLayout">
          {cards.map((card, index) => {
            let variant = "hidden";
            if (index === 0) variant = "front";
            else if (index === 1) variant = "middle";
            else if (index === 2) variant = "back";

            return (
              <motion.div
                key={(card as React.ReactElement).key || index}
                layout
                initial={false}
                animate={variant}
                exit={{
                  x: "50%",
                  opacity: 0,
                  scale: 0.8,
                  transition: { duration: 0.3 },
                }}
                variants={cardVariants}
                className="absolute top-0 left-0 w-full h-full cursor-pointer origin-bottom-right"
                style={{ transformStyle: "preserve-3d" }}
                onClick={() => moveToEnd(0)}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 50) {
                    // Reduced drag threshold
                    moveToEnd(0);
                  }
                }}
              >
                {card}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StackedCardCarousel;
