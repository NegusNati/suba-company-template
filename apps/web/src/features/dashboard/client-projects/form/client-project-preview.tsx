import type { Partner } from "../../partners/lib/partners-schema";
import type { Service } from "../../services/lib/services-schema";
import type { Tag } from "../../tags/lib/tags-schema";

import { LexicalViewer } from "@/components/common/rich-text/LexicalViewer";

interface ClientProjectPreviewProps {
  title: string;
  excerpt: string;
  overview: string;
  client?: Partner;
  projectScope: string;
  impact?: string;
  problem?: string;
  process?: string;
  deliverable?: string;
  service?: Service;
  tags: Tag[];
  imagePreviews: string[];
}

export default function ClientProjectPreview({
  title,
  excerpt,
  overview,
  client,
  projectScope,
  impact,
  problem,
  process,
  deliverable,
  service,
  tags,
  imagePreviews,
}: ClientProjectPreviewProps) {
  return (
    <div className="space-y-6 p-4">
      {/* Gallery-style images */}
      {imagePreviews.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Images
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {imagePreviews.map((src, index) => (
              <div
                key={src + index}
                className="relative aspect-video rounded-lg overflow-hidden bg-gray-200"
              >
                <img
                  src={src}
                  alt={`Project image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Add images to see the preview here.
        </div>
      )}

      {title && <h1 className="text-3xl font-bold">{title}</h1>}

      {excerpt && <p className="text-muted-foreground">{excerpt}</p>}

      {overview && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Overview</h3>
          <p className="text-base text-gray-700">{overview}</p>
        </div>
      )}

      {client && (
        <div className="space-y-1">
          <h4 className="text-xs uppercase text-muted-foreground">Client</h4>
          <p className="text-sm font-medium">{client.title}</p>
        </div>
      )}

      {service && (
        <div className="space-y-1">
          <h4 className="text-xs uppercase text-muted-foreground">Service</h4>
          <p className="text-sm font-medium">{service.title}</p>
        </div>
      )}

      {tags.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs uppercase text-muted-foreground">Tags</h4>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {projectScope && (
        <div className="space-y-1">
          <h4 className="text-xs uppercase text-muted-foreground">Scope</h4>
          <p className="text-sm text-gray-700">{projectScope}</p>
        </div>
      )}

      {impact && (
        <div className="space-y-1">
          <h4 className="text-xs uppercase text-muted-foreground">Impact</h4>
          <p className="text-sm text-gray-700">{impact}</p>
        </div>
      )}

      {problem && (
        <div className="space-y-1">
          <h4 className="text-xs uppercase text-muted-foreground">Problem</h4>
          <p className="text-sm text-gray-700">{problem}</p>
        </div>
      )}

      {process && (
        <div className="space-y-1">
          <h4 className="text-xs uppercase text-muted-foreground">Process</h4>
          <p className="text-sm text-gray-700">{process}</p>
        </div>
      )}

      {deliverable && (
        <div className="space-y-1">
          <h4 className="text-xs uppercase text-muted-foreground">
            Deliverable
          </h4>
          <p className="text-sm text-gray-700">{deliverable}</p>
        </div>
      )}

      {/* Rich content viewer placeholders */}
      <div className="space-y-1">
        <h4 className="text-xs uppercase text-muted-foreground">Rich Notes</h4>
        <div className="prose prose-sm max-w-none text-gray-700">
          <LexicalViewer content={overview || ""} />
        </div>
      </div>
    </div>
  );
}
