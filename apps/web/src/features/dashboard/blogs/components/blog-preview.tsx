import type { Tag } from "../../tags/lib/tags-schema";

import { AppImage } from "@/components/common/AppImage";
import { LexicalViewer } from "@/components/common/rich-text/LexicalViewer";

interface BlogPreviewProps {
  title: string;
  excerpt: string;
  content: string;
  publishDate?: string;
  readTimeMinutes?: number;
  selectedTags: Tag[];
  imagePreviews: string[];
}

export default function BlogPreview({
  title,
  excerpt,
  content,
  publishDate,
  readTimeMinutes,
  selectedTags,
  imagePreviews,
}: BlogPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Preview</h2>
        {publishDate && (
          <span className="text-xs text-muted-foreground">
            Scheduled for {publishDate}
          </span>
        )}
      </div>

      {imagePreviews[0] && (
        <div className="overflow-hidden rounded-lg border bg-muted">
          <AppImage
            src={imagePreviews[0]}
            alt="Featured"
            className="h-48 w-full object-cover"
          />
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-2xl font-bold">{title || "Blog title"}</h3>
        <p className="text-sm text-muted-foreground">
          {excerpt || "Short summary of the blog..."}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {readTimeMinutes ? <span>{readTimeMinutes} min read</span> : null}
          {selectedTags.length > 0 && (
            <>
              <span>•</span>
              <div className="flex flex-wrap gap-1">
                {selectedTags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary"
                  >
                    {tag.name}
                  </span>
                ))}
                {selectedTags.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{selectedTags.length - 3} more
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        {content ? (
          <LexicalViewer content={content} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Blog content will appear here as you type.
          </p>
        )}
      </div>
    </div>
  );
}
