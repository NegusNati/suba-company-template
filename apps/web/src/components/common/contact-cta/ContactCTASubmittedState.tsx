import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

type ContactCTASubmittedStateProps = {
  onSendAnother: () => void;
};

export function ContactCTASubmittedState({
  onSendAnother,
}: ContactCTASubmittedStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full flex flex-col items-center justify-center py-12 text-center"
    >
      <CheckCircle2 className="h-16 w-16 text-white mb-4" />
      <h3 className="text-2xl font-serif font-medium text-white mb-2">
        Thank you!
      </h3>
      <p className="text-white/80 mb-6 max-w-sm">
        We&apos;ve received your message and will get back to you as soon as
        possible.
      </p>
      <Button
        variant="outline"
        onClick={onSendAnother}
        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
      >
        Send Another Message
      </Button>
    </motion.div>
  );
}
