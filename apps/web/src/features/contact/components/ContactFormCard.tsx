import { useForm } from "@tanstack/react-form";
import { CheckCircle2 } from "lucide-react";
import { motion, type Variants } from "motion/react";
import React, { useState } from "react";

import { ServicePillButton } from "./ServicePillButton";
import { useSubmitContactMutation } from "../lib";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePublicServices } from "@/lib/services/services-query";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export const ContactFormCard: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch services from API
  const { data: servicesData, isPending: servicesLoading } = usePublicServices({
    page: 1,
    limit: 50,
  });
  const services = servicesData?.data || [];

  const submitMutation = useSubmitContactMutation({
    onSuccess: () => {
      setIsSubmitted(true);
    },
  });

  const form = useForm({
    defaultValues: {
      fullName: "",
      contact: "",
      message: "",
      serviceId: null as number | null,
    },
    onSubmit: async ({ value }) => {
      await submitMutation.mutateAsync(value);
    },
  });

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 15,
            delay: 0.2,
          }}
        >
          <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
        </motion.div>
        <h3 className="text-xl font-semibold mb-2">
          Thank you for contacting us!
        </h3>
        <p className="text-muted-foreground mb-6">
          We've received your message and will get back to you as soon as
          possible.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setIsSubmitted(false);
            form.reset();
          }}
        >
          Send Another Message
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {/* Section Label */}
        <motion.p
          variants={itemVariants}
          className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        >
          Contact Information
        </motion.p>

        {/* Name and Contact - Inline on desktop */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <form.Field
            name="fullName"
            validators={{
              onBlur: ({ value }) => {
                if (!value || value.trim() === "") {
                  return "Full name is required";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Full Name"
                  disabled={submitMutation.isPending}
                  className="h-12 text-sm bg-card border-border focus:border-primary focus:ring-primary"
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive mt-1.5">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="contact"
            validators={{
              onBlur: ({ value }) => {
                if (!value || value.trim() === "") {
                  return "Email or phone is required";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Email Or Phone Number"
                  disabled={submitMutation.isPending}
                  className="h-12 text-sm bg-card border-border focus:border-primary focus:ring-primary"
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive mt-1.5">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
              </div>
            )}
          </form.Field>
        </motion.div>

        {/* Message Textarea */}
        <motion.div variants={itemVariants}>
          <form.Field
            name="message"
            validators={{
              onBlur: ({ value }) => {
                if (!value || value.trim() === "") {
                  return "Please tell us about your project";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Tell us about your project"
                  rows={5}
                  disabled={submitMutation.isPending}
                  className="text-sm bg-card border-border focus:border-primary focus:ring-primary min-h-[140px] resize-none"
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive mt-1.5">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
              </div>
            )}
          </form.Field>
        </motion.div>

        {/* Service Selection - Pill Buttons */}
        <motion.div variants={itemVariants} className="space-y-4 pt-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            What Do You Need Help With?
          </p>
          <form.Field name="serviceId">
            {(field) => (
              <div>
                {servicesLoading ? (
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-32 rounded-full bg-muted animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {services.map((service) => (
                      <ServicePillButton
                        key={service.id}
                        label={service.title}
                        isSelected={field.state.value === service.id}
                        onClick={() =>
                          field.handleChange(
                            field.state.value === service.id
                              ? null
                              : service.id,
                          )
                        }
                        disabled={submitMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </form.Field>
        </motion.div>

        {/* Error display */}
        {submitMutation.isError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <p className="text-sm text-destructive">
              {submitMutation.error?.message ||
                "Failed to submit form. Please try again."}
            </p>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div variants={itemVariants} className="pt-4">
          <Button
            type="submit"
            disabled={submitMutation.isPending}
            className="w-full h-12 text-sm font-medium rounded-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5"
          >
            {submitMutation.isPending ? "Sending..." : "Send Message"}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};
