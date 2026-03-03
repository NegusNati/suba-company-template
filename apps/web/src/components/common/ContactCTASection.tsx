import { useForm } from "@tanstack/react-form";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { ContactCTAInfoPanel } from "./contact-cta/ContactCTAInfoPanel";
import { ContactCTAOverlayShell } from "./contact-cta/ContactCTAOverlayShell";
import { ContactCTASubmittedState } from "./contact-cta/ContactCTASubmittedState";
import { ContactCTATrigger } from "./contact-cta/ContactCTATrigger";

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

  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(() => {
      setIsSubmitted(false);
    }, 300);
  };

  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isExpanded]);

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
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-foreground mb-4 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Let&apos;s discuss how we can help transform your digital presence
            and accelerate your business growth.
          </p>
          <ContactCTATrigger
            isExpanded={isExpanded}
            onExpand={() => setIsExpanded(true)}
          />
        </div>
      </section>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <ContactCTAOverlayShell onClose={handleClose}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="relative z-10 flex flex-col lg:flex-row h-full w-full max-w-6xl mx-auto overflow-y-auto"
            >
              <ContactCTAInfoPanel />

              <div className="flex-1 p-8 sm:p-12 lg:p-16 flex items-center w-full">
                {isSubmitted ? (
                  <ContactCTASubmittedState
                    onSendAnother={() => {
                      setIsSubmitted(false);
                      form.reset();
                    }}
                  />
                ) : (
                  <form
                    className="w-full space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      form.handleSubmit();
                    }}
                  >
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
                            onChange={(e) => field.handleChange(e.target.value)}
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
                            onChange={(e) => field.handleChange(e.target.value)}
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
                                  className={
                                    field.state.value === service.id
                                      ? "flex items-center px-4 py-2.5 rounded-lg border text-sm transition-all text-left bg-white text-primary border-white"
                                      : "flex items-center px-4 py-2.5 rounded-lg border text-sm transition-all text-left bg-white/5 border-white/10 text-white hover:bg-white/10"
                                  }
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
                            onChange={(e) => field.handleChange(e.target.value)}
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

                    {submitMutation.isError && (
                      <div className="p-4 bg-white/10 border border-white/20 rounded-lg">
                        <p className="text-sm text-white">
                          {submitMutation.error?.message ||
                            "Failed to submit form. Please try again."}
                        </p>
                      </div>
                    )}

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
          </ContactCTAOverlayShell>
        )}
      </AnimatePresence>
    </>
  );
}
