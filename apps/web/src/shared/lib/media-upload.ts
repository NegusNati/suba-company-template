import { IMAGE_MIME_TYPES } from "@suba-company-template/types";

type MediaKind = "image" | "video";

const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/ogg"] as const;

export function isValidImageFile(file: File): boolean {
  return IMAGE_MIME_TYPES.includes(
    file.type as (typeof IMAGE_MIME_TYPES)[number],
  );
}

export function isValidVideoFile(file: File): boolean {
  return (VIDEO_MIME_TYPES as readonly string[]).includes(file.type);
}

export function isValidFileSize(file: File, kind: MediaKind): boolean {
  const limit = kind === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB / 50MB
  return file.size <= limit;
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as data URL"));
      }
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("Failed to read file as data URL"));
    };

    reader.readAsDataURL(file);
  });
}

export function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    fileToDataURL(file)
      .then((url) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };
        img.src = url;
      })
      .catch(reject);
  });
}

export function getVideoDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    fileToDataURL(file)
      .then((url) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          resolve({
            width: video.videoWidth,
            height: video.videoHeight,
          });
        };
        video.onerror = () => {
          reject(new Error("Failed to load video metadata"));
        };
        video.src = url;
      })
      .catch(reject);
  });
}
