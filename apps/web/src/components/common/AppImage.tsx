import { forwardRef } from "react";
import type { ImgHTMLAttributes } from "react";

type ImageLoading = "eager" | "lazy";
type ImageDecoding = "sync" | "async" | "auto";
type ImageFetchPriority = "high" | "low" | "auto";

export interface AppImageProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "loading" | "decoding" | "fetchPriority"
  > {
  priority?: boolean;
  loading?: ImageLoading;
  decoding?: ImageDecoding;
  fetchPriority?: ImageFetchPriority;
}

export const AppImage = forwardRef<HTMLImageElement, AppImageProps>(
  (
    {
      priority = false,
      loading,
      decoding = "async",
      fetchPriority,
      alt,
      ...props
    },
    ref,
  ) => {
    const resolvedLoading = loading ?? (priority ? "eager" : "lazy");
    const resolvedFetchPriority = fetchPriority ?? (priority ? "high" : "auto");

    return (
      <img
        ref={ref}
        alt={alt}
        loading={resolvedLoading}
        decoding={decoding}
        fetchPriority={resolvedFetchPriority}
        {...props}
      />
    );
  },
);

AppImage.displayName = "AppImage";
