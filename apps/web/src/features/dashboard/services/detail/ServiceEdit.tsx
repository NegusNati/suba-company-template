import { ServiceForm } from "../form/service-form";
import { useServiceByIdQuery } from "../lib/services-query";
import type { UpdateService } from "../lib/services-schema";

interface ServiceEditProps {
  serviceId: number;
}

export default function ServiceEdit({ serviceId }: ServiceEditProps) {
  const { data, isPending, isError, error } = useServiceByIdQuery(serviceId);

  if (isPending) {
    return <div className="p-8">Loading service...</div>;
  }

  if (isError || !data?.data) {
    return (
      <div className="p-8 text-destructive">
        Failed to load service{error ? `: ${error.message}` : ""}
      </div>
    );
  }

  const service = data.data;

  const initialData: UpdateService = {
    id: service.id,
    title: service.title,
    excerpt: service.excerpt ?? "",
    description: service.description ?? "",
    existingImages: service.images ?? [],
  };

  return <ServiceForm mode="edit" initialData={initialData} />;
}
