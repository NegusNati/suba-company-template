interface GalleryPreviewProps {
  title?: string;
  description?: string;
  occurredAt?: string;
  imagePreview?: string | null;
}

export function GalleryPreview({
  title,
  description,
  occurredAt,
  imagePreview,
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
    <div className="sticky top-8">
      <h3 className="text-lg font-semibold mb-4">Preview</h3>
      <div className="border rounded-lg p-6 bg-card space-y-4">
        {/* Image preview */}
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground text-sm">
              No image selected
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Title
          </p>
          <p className="font-medium">
            {title || (
              <span className="text-muted-foreground italic">Untitled</span>
            )}
          </p>
        </div>

        {/* Description */}
        {description && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Description
            </p>
            <p className="text-sm whitespace-pre-wrap">{description}</p>
          </div>
        )}

        {/* Occurred date */}
        {occurredAt && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Occurred On
            </p>
            <p className="text-sm">{formatDate(occurredAt) || occurredAt}</p>
          </div>
        )}
      </div>
    </div>
  );
}
