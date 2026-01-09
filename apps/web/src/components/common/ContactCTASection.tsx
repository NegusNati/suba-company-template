import { useForm } from "@tanstack/react-form";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Phone, Mail, MapPin, Check, Zap } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  contactFieldValidators,
  useSubmitContactMutation,
} from "@/features/contact/lib";
import { usePublicServices } from "@/lib/services/services-query";

export function ContactCTASection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    // Reset form state after animation completes
    setTimeout(() => {
      setIsSubmitted(false);
    }, 300);
  };

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isExpanded]);

  // Fetch services for selection
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
      await submitMutation.mutateAsync({
        fullName: value.fullName,
        contact: value.contact,
        message: value.message,
        serviceId: value.serviceId,
      });
    },
  });

  return (
    <>
      {/* CTA Section with Button */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-foreground mb-4 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Let's discuss how we can help transform your digital presence and
            accelerate your business growth.
          </p>

          <AnimatePresence initial={false}>
            {!isExpanded && (
              <motion.div className="inline-block relative">
                <motion.div
                  style={{
                    borderRadius: "100px",
                  }}
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
                  onClick={handleExpand}
                  className="h-14 px-8 py-3 text-lg font-medium text-primary-foreground tracking-tight relative"
                >
                  Contact Us
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Expanded Contact Form Overlay */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              layoutId="contact-cta-card"
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              style={{
                borderRadius: "24px",
              }}
              layout
              className="relative flex h-full w-full max-h-[95vh] overflow-hidden bg-primary transform-gpu will-change-transform"
            >
              {/* Decorative Background Pattern */}
              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ borderRadius: "24px" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  />
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative z-10 flex flex-col lg:flex-row h-full w-full max-w-6xl mx-auto overflow-y-auto"
              >
                {/* Left Panel - Info */}
                <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 text-white min-h-[400px]">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium leading-tight tracking-tight mb-6 mt-8 sm:mt-0">
                    Let's talk
                  </h2>

                  <div className="space-y-5 hidden sm:block">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                          Learn how we can transform your business with tailored
                          solutions and flexible pricing options.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                          Experience firsthand how our platform accelerates
                          delivery & drives results.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-10 pt-8 border-t border-white/20 space-y-4">
                    <div className="flex items-center gap-3 text-white/80">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">+ 251 90 000 0000</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/80">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">contact@example.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/80">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Addis Ababa, Ethiopia</span>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Form */}
                <div className="flex-1 p-8 sm:p-12 lg:p-16 flex items-center w-full">
                  {isSubmitted ? (
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
                        We've received your message and will get back to you as
                        soon as possible.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsSubmitted(false);
                          form.reset();
                        }}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <form
                      className="w-full space-y-5"
                      onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                      }}
                    >
                      {/* Full Name */}
                      <form.Field
                        name="fullName"
                        validators={{
                          onBlur: ({ value }) =>
                            contactFieldValidators.fullName(value),
                          onSubmit: ({ value }) =>
                            contactFieldValidators.fullName(value),
                        }}
                      >
                        {(field) => (
                          <div>
                            <label
                              htmlFor={field.name}
                              className="block text-xs font-mono font-normal text-white/70 mb-2 tracking-wide uppercase"
                            >
                              Full Name *
                            </label>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              disabled={submitMutation.isPending}
                              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border-0 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm h-11"
                            />
                            {field.state.meta.errors.length > 0 && (
                              <p className="mt-1 text-xs text-rose-100">
                                {field.state.meta.errors[0]}
                              </p>
                            )}
                          </div>
                        )}
                      </form.Field>

                      {/* Contact Info (Email/Phone) */}
                      <form.Field
                        name="contact"
                        validators={{
                          onBlur: ({ value }) =>
                            contactFieldValidators.contact(value),
                          onSubmit: ({ value }) =>
                            contactFieldValidators.contact(value),
                        }}
                      >
                        {(field) => (
                          <div>
                            <label
                              htmlFor={field.name}
                              className="block text-xs font-mono font-normal text-white/70 mb-2 tracking-wide uppercase"
                            >
                              Email or Phone *
                            </label>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              disabled={submitMutation.isPending}
                              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border-0 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm h-11"
                            />
                            {field.state.meta.errors.length > 0 && (
                              <p className="mt-1 text-xs text-rose-100">
                                {field.state.meta.errors[0]}
                              </p>
                            )}
                          </div>
                        )}
                      </form.Field>

                      {/* Service Selection */}
                      <form.Field name="serviceId">
                        {(field) => (
                          <div>
                            <label className="block text-xs font-mono font-normal text-white/70 mb-2 tracking-wide uppercase">
                              How can we help?
                            </label>
                            {servicesLoading ? (
                              <div className="text-white/50 text-sm h-11 flex items-center">
                                Loading services...
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {services.map((service) => (
                                  <button
                                    key={service.id}
                                    type="button"
                                    onClick={() =>
                                      field.handleChange(
                                        field.state.value === service.id
                                          ? null
                                          : service.id,
                                      )
                                    }
                                    className={`
                                      flex items-center px-4 py-2.5 rounded-lg border text-sm transition-all text-left
                                      ${
                                        field.state.value === service.id
                                          ? "bg-white text-primary border-white"
                                          : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                      }
                                    `}
                                  >
                                    <span className="flex-1 truncate">
                                      {service.title}
                                    </span>
                                    {field.state.value === service.id && (
                                      <Check className="w-4 h-4 ml-2 flex-shrink-0" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </form.Field>

                      {/* Message */}
                      <form.Field
                        name="message"
                        validators={{
                          onBlur: ({ value }) =>
                            contactFieldValidators.message(value),
                          onSubmit: ({ value }) =>
                            contactFieldValidators.message(value),
                        }}
                      >
                        {(field) => (
                          <div>
                            <label
                              htmlFor={field.name}
                              className="block text-xs font-mono font-normal text-white/70 mb-2 tracking-wide uppercase"
                            >
                              Message *
                            </label>
                            <Textarea
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              rows={3}
                              disabled={submitMutation.isPending}
                              className="w-full px-4 py-3 rounded-lg bg-white/10 border-0 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none text-sm"
                            />
                            {field.state.meta.errors.length > 0 && (
                              <p className="mt-1 text-xs text-rose-100">
                                {field.state.meta.errors[0]}
                              </p>
                            )}
                          </div>
                        )}
                      </form.Field>

                      {/* Error display */}
                      {submitMutation.isError && (
                        <div className="p-4 bg-white/10 border border-white/20 rounded-lg">
                          <p className="text-sm text-white">
                            {submitMutation.error?.message ||
                              "Failed to submit form. Please try again."}
                          </p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="w-full px-8 py-2.5 rounded-full bg-white text-primary font-medium hover:bg-white/90 transition-colors tracking-tight h-11"
                      >
                        {submitMutation.isPending ? "Sending..." : "Submit"}
                      </Button>
                    </form>
                  )}
                </div>
              </motion.div>

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={handleClose}
                className="absolute right-4 top-4 sm:right-6 sm:top-6 z-20 flex h-10 w-10 items-center justify-center text-white bg-white/10 transition-colors hover:bg-white/20 rounded-full"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
