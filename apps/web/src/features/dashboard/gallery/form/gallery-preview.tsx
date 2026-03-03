import { AppImage } from "@/components/common/AppImage";

interface GalleryPreviewProps {
  title?: string;
  description?: string;
  occurredAt?: string;
  categoryName?: string;
  imagePreviews: string[];
}

export function GalleryPreview({
  title,
  description,
  occurredAt,
  categoryName,
  imagePreviews,
}: GalleryPreviewProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;

    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="sticky top-8 space-y-4">
      <h3 className="text-lg font-semibold">Preview</h3>

      <div className="space-y-4 rounded-lg border bg-card p-6">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Images ({imagePreviews.length})
          </p>
          {imagePreviews.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {imagePreviews.map((src, index) => (
                <div
                  key={`${src}-${index}`}
                  className="aspect-video overflow-hidden rounded-md bg-muted"
                >
                  <AppImage
                    src={src}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
              No images selected
            </div>
          )}
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-muted-foreground">
            Title
          </p>
          <p className="font-medium">
            {title || (
              <span className="italic text-muted-foreground">Untitled</span>
            )}
          </p>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-muted-foreground">
            Category
          </p>
          <p>
            {categoryName || (
              <span className="italic text-muted-foreground">Not selected</span>
            )}
          </p>
        </div>

        {description && (
          <div>
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              Description
            </p>
            <p className="whitespace-pre-wrap text-sm">{description}</p>
          </div>
        )}

        {occurredAt && (
          <div>
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              Occurred On
            </p>
            <p className="text-sm">{formatDate(occurredAt) || occurredAt}</p>
          </div>
        )}
      </div>
    </div>
  );
}
