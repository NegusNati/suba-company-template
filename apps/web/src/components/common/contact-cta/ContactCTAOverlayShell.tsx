import { X } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

type ContactCTAOverlayShellProps = {
  children: ReactNode;
  onClose: () => void;
};

export function ContactCTAOverlayShell({
  children,
  onClose,
}: ContactCTAOverlayShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        layoutId="contact-cta-card"
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ borderRadius: "24px" }}
        layout
        className="relative flex h-full w-full max-h-[95vh] overflow-hidden bg-primary transform-gpu will-change-transform"
      >
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ borderRadius: "24px" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
          <div className="absolute inset-0 opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            />
          </div>
        </motion.div>

        {children}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={onClose}
          className="absolute right-4 top-4 sm:right-6 sm:top-6 z-20 flex h-10 w-10 items-center justify-center text-white bg-white/10 transition-colors hover:bg-white/20 rounded-full"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
