import { LexicalViewer } from "@/components/common/rich-text/LexicalViewer";

interface ServicePreviewProps {
  title: string;
  excerpt: string;
  description: string;
  imagePreviews: string[];
}

export default function ServicePreview({
  title,
  excerpt,
  description,
  imagePreviews,
}: ServicePreviewProps) {
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
                  alt={`Service image ${index + 1}`}
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

      {/* Title */}
      {title && <h1 className="text-3xl font-bold">{title}</h1>}

      {/* Excerpt */}
      {excerpt && (
        <div className="space-y-2">
          <p className="text-muted-foreground">{excerpt}</p>
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Description</h3>
          <div className="prose prose-gray max-w-none text-base dark:prose-invert">
            <LexicalViewer content={description} />
          </div>
        </div>
      )}
    </div>
  );
}
