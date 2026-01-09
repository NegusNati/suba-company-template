import { ContactUsForm } from "../ContactUsForm";
import { useContactByIdQuery } from "../lib/contact-query";
import type { UpdateContact } from "../lib/contact-schema";

interface ContactViewProps {
  contactId: number;
}

export default function ContactView({ contactId }: ContactViewProps) {
  const { data, isPending, isError, error } = useContactByIdQuery(contactId);

  if (isPending) return <div className="p-8">Loading contact...</div>;
  if (isError || !data?.data)
    return (
      <div className="p-8 text-destructive">
        Failed to load contact{error ? `: ${error.message}` : ""}
      </div>
    );

  const contact = data.data;
  const initialData: UpdateContact = {
    fullName: contact.fullName,
    contact: contact.contact,
    message: contact.message,
    serviceId: contact.serviceId ?? null,
    isHandled: contact.isHandled,
  };

  return (
    <ContactUsForm
      mode="view"
      contactUs={{ ...contact, ...initialData, id: contact.id }}
    />
  );
}
