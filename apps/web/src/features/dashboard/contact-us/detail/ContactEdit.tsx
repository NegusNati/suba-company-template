import { ContactUsForm } from "../ContactUsForm";
import { useContactByIdQuery } from "../lib/contact-query";
import type { UpdateContact } from "../lib/contact-schema";

interface ContactEditProps {
  contactId: number;
}

export default function ContactEdit({ contactId }: ContactEditProps) {
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
      mode="edit"
      contactUs={{ ...contact, ...initialData, id: contact.id }}
    />
  );
}
