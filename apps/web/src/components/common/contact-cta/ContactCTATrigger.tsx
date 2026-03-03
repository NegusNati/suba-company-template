import { AnimatePresence, motion } from "motion/react";

type ContactCTATriggerProps = {
  isExpanded: boolean;
  onExpand: () => void;
};

export function ContactCTATrigger({
  isExpanded,
  onExpand,
}: ContactCTATriggerProps) {
  return (
    <AnimatePresence initial={false}>
      {!isExpanded && (
        <motion.div className="inline-block relative">
          <motion.div
            style={{ borderRadius: "100px" }}
            layout
            layoutId="contact-cta-card"
            className="absolute inset-0 bg-primary items-center justify-center transform-gpu will-change-transform"
          />
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout={false}
            onClick={onExpand}
            className="h-14 px-8 py-3 text-lg font-medium text-primary-foreground tracking-tight relative"
          >
            Contact Us
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
