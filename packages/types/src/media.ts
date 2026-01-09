export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;

export type ImageMimeType = (typeof IMAGE_MIME_TYPES)[number];

export const IMAGE_MIME_ACCEPT = IMAGE_MIME_TYPES.join(",");

export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type DocumentMimeType = (typeof DOCUMENT_MIME_TYPES)[number];

export const DOCUMENT_MIME_ACCEPT = DOCUMENT_MIME_TYPES.join(",");
