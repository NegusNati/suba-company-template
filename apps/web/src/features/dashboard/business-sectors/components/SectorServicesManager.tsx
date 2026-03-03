import { GripVertical, ImageIcon, Plus, Trash2 } from "lucide-react";

import type { BusinessSectorServiceFormItem } from "../lib/business-sectors-schema";

import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/lib/api-base";

interface SectorServicesManagerProps {
  services: BusinessSectorServiceFormItem[];
  onChange: (items: BusinessSectorServiceFormItem[]) => void;
  isReadOnly?: boolean;
}

const resolveImageUrl = (url?: string) => {
  if (!url) return "";
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return url.startsWith("/") ? `${baseUrl}${url}` : url;
};

const normalizePositions = (items: BusinessSectorServiceFormItem[]) =>
  items.map((item, index) => ({ ...item, position: index }));

export function SectorServicesManager({
  services,
  onChange,
  isReadOnly = false,
}: SectorServicesManagerProps) {
  const addService = () => {
    onChange(
      normalizePositions([
        ...services,
        {
          title: "",
          description: "",
          position: services.length,
        },
      ]),
    );
  };

  const updateService = (
    index: number,
    patch: Partial<BusinessSectorServiceFormItem>,
  ) => {
    const next = [...services];
    const current = next[index];
    if (!current) return;

    next[index] = { ...current, ...patch };
    onChange(normalizePositions(next));
  };

  const removeService = (index: number) => {
    onChange(normalizePositions(services.filter((_, i) => i !== index)));
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...services];
    [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
    onChange(normalizePositions(next));
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <FieldLabel>Services</FieldLabel>
        {!isReadOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addService}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        )}
      </div>

      {services.length === 0 ? (
        <p className="text-sm text-muted-foreground">No services added.</p>
      ) : (
        <div className="space-y-4">
          {services.map((service, index) => {
            const preview =
              service.previewUrl ||
              (service.imageUrl ? resolveImageUrl(service.imageUrl) : "");

            return (
              <div
                key={`${service.title}-${index}`}
                className="rounded-lg border bg-background p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="transition-colors hover:text-foreground disabled:opacity-30"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                    )}
                    <span>Service #{index + 1}</span>
                  </div>

                  {!isReadOnly && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeService(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    value={service.title}
                    onChange={(event) =>
                      updateService(index, { title: event.target.value })
                    }
                    placeholder="Service title"
                    disabled={isReadOnly}
                  />

                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      updateService(index, {
                        imageFile: file,
                        previewUrl: URL.createObjectURL(file),
                      });
                    }}
                    disabled={isReadOnly}
                  />
                </div>

                <Textarea
                  value={service.description ?? ""}
                  onChange={(event) =>
                    updateService(index, { description: event.target.value })
                  }
                  placeholder="Description"
                  rows={3}
                  className="mt-3"
                  disabled={isReadOnly}
                />

                {preview ? (
                  <div className="mt-3 h-32 overflow-hidden rounded-md border bg-muted">
                    <img
                      src={preview}
                      alt={service.title || `Service ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mt-3 flex h-20 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span className="ml-2 text-sm">No image selected</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
