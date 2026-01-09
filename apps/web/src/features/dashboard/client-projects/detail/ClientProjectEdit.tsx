import { ClientProjectForm } from "../form/client-project-form";
import { useClientProjectByIdQuery } from "../lib/client-projects-query";
import type { UpdateClientProject } from "../lib/client-projects-schema";

interface ClientProjectEditProps {
  clientProjectId: number;
}

export default function ClientProjectEdit({
  clientProjectId,
}: ClientProjectEditProps) {
  const { data, isPending, isError, error } =
    useClientProjectByIdQuery(clientProjectId);

  if (isPending) {
    return <div className="p-8">Loading client project...</div>;
  }

  if (isError || !data?.data) {
    return (
      <div className="p-8 text-destructive">
        Failed to load client project{error ? `: ${error.message}` : ""}
      </div>
    );
  }

  const project = data.data;

  const initialData: UpdateClientProject = {
    id: project.id,
    title: project.title,
    excerpt: project.excerpt,
    overview: project.overview,
    clientId: project.clientId,
    projectScope: project.projectScope,
    impact: project.impact ?? "",
    problem: project.problem ?? "",
    process: project.process ?? "",
    deliverable: project.deliverable ?? "",
    serviceId: project.serviceId,
    tagIds: project.tags?.map((tag) => tag.id) ?? [],
    existingImages: project.images ?? [],
  };

  return <ClientProjectForm mode="edit" initialData={initialData} />;
}
