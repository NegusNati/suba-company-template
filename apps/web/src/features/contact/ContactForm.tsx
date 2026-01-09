import { useForm } from "@tanstack/react-form";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { contactFieldValidators, useSubmitContactMutation } from "./lib";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePublicServices } from "@/lib/services/services-query";

interface ContactFormProps {
  defaultServiceId?: number;
  onSuccess?: () => void;
  className?: string;
  showServiceSelector?: boolean;
}

export function ContactForm({
  defaultServiceId,
  onSuccess,
  className,
  showServiceSelector = true,
}: ContactFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch services for the dropdown
  const { data: servicesData, isPending: servicesLoading } = usePublicServices({
    page: 1,
    limit: 50, // Max allowed by public API
  });

  const services = servicesData?.data || [];

  const submitMutation = useSubmitContactMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      onSuccess?.();
    },
  });

  const form = useForm({
    defaultValues: {
      fullName: "",
      contact: "",
      message: "",
      serviceId: defaultServiceId || null,
    },
    // Client-side validation happens through field validators and API guard
    onSubmit: async ({ value }) => {
      await submitMutation.mutateAsync({
        fullName: value.fullName,
        contact: value.contact,
        message: value.message,
        serviceId: value.serviceId,
      });
    },
  });

  if (isSubmitted) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Thank you for contacting us!
          </h3>
          <p className="text-muted-foreground text-center mb-6">
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Get in Touch</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Full Name */}
          <form.Field
            name="fullName"
            validators={{
              onBlur: ({ value }) => contactFieldValidators.fullName(value),
              onSubmit: ({ value }) => contactFieldValidators.fullName(value),
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Full Name <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="John Doe"
                  disabled={submitMutation.isPending}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
              </Field>
            )}
          </form.Field>

          {/* Contact (Email or Phone) */}
          <form.Field
            name="contact"
            validators={{
              onBlur: ({ value }) => contactFieldValidators.contact(value),
              onSubmit: ({ value }) => contactFieldValidators.contact(value),
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Email or Phone <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="john@example.com or +1 234 567 8900"
                  disabled={submitMutation.isPending}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
              </Field>
            )}
          </form.Field>

          {/* Service Selector */}
          {showServiceSelector && (
            <form.Field name="serviceId">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Service (Optional)
                  </FieldLabel>
                  {servicesLoading ? (
                    <div className="text-sm text-muted-foreground">
                      Loading services...
                    </div>
                  ) : (
                    <Select
                      value={field.state.value?.toString() || ""}
                      onValueChange={(value) =>
                        field.handleChange(value ? parseInt(value, 10) : null)
                      }
                      disabled={submitMutation.isPending}
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder="Select a service (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {services.map((service) => (
                          <SelectItem
                            key={service.id}
                            value={service.id.toString()}
                          >
                            {service.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Which service are you inquiring about?
                  </p>
                </Field>
              )}
            </form.Field>
          )}

          {/* Message */}
          <form.Field
            name="message"
            validators={{
              onBlur: ({ value }) => contactFieldValidators.message(value),
              onSubmit: ({ value }) => contactFieldValidators.message(value),
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Message <span className="text-red-500">*</span>
                </FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  placeholder="Tell us about your inquiry..."
                  disabled={submitMutation.isPending}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={6}
                />
                {field.state.meta.errors &&
                  field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
              </Field>
            )}
          </form.Field>

          {/* Error display */}
          {submitMutation.isError && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">
                {submitMutation.error?.message ||
                  "Failed to submit form. Please try again."}
              </p>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
