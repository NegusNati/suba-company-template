import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join, sep } from "path";

import {
  DOCUMENT_MIME_TYPES,
  IMAGE_MIME_TYPES,
} from "@suba-company-template/types";
import { fileTypeFromBuffer } from "file-type";

export class FileUploadError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "FileUploadError";
  }
}

export interface UploadOptions {
  subdir: string;
  maxSize?: number; // bytes, default from env or 5MB
  allowedMimes?: string[]; // default image types
}

const DEFAULT_MAX_SIZE =
  Number(process.env.UPLOAD_MAX_BYTES) || 5 * 1024 * 1024; // 5MB fallback
const DEFAULT_MIME_TYPES = [...IMAGE_MIME_TYPES];

const ensureSafeSubdir = (subdir: string) => {
  if (subdir.includes("..") || subdir.startsWith(sep)) {
    throw new FileUploadError(400, "Invalid upload path");
  }
};

export const uploadFile = async (
  file: File,
  options: UploadOptions,
): Promise<string> => {
  const {
    subdir,
    maxSize = DEFAULT_MAX_SIZE,
    allowedMimes = DEFAULT_MIME_TYPES,
  } = options;

  // Validate file exists
  if (!file) {
    throw new FileUploadError(400, "No file provided");
  }

  // Validate file size
  if (file.size > maxSize) {
    throw new FileUploadError(
      400,
      `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    );
  }

  // Validate MIME type
  if (!allowedMimes.includes(file.type)) {
    throw new FileUploadError(
      400,
      `File type not allowed. Allowed types: ${allowedMimes.join(", ")}`,
    );
  }

  // Create uploads directory if it doesn't exist
  ensureSafeSubdir(subdir);
  const uploadsDir = join(process.cwd(), "uploads", subdir);
  await mkdir(uploadsDir, { recursive: true });

  // Generate unique filename
  const fallbackExt = file.name.split(".").pop() || "bin";
  const filenameBase = `${Date.now()}-${randomBytes(8).toString("hex")}`;

  // Convert File to buffer for MIME sniffing
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const detected = await fileTypeFromBuffer(buffer);
  const finalMime = detected?.mime || file.type;
  const ext = detected?.ext || fallbackExt;

  if (!allowedMimes.includes(finalMime)) {
    throw new FileUploadError(
      400,
      `Detected file type not allowed (${finalMime}). Allowed: ${allowedMimes.join(", ")}`,
    );
  }

  const filename = `${filenameBase}.${ext}`;
  const filePath = join(uploadsDir, filename);

  // Write to disk
  await writeFile(filePath, buffer);

  // Return relative URL path
  return `/uploads/${subdir}/${filename}`;
};

// Module-specific helpers
export const uploadBlogImage = (file: File): Promise<string> =>
  uploadFile(file, { subdir: "blogs" });

export const uploadGalleryImage = (file: File): Promise<string> =>
  uploadFile(file, { subdir: "gallery" });

export const uploadServiceImage = (file: File): Promise<string> =>
  uploadFile(file, { subdir: "services" });

export const uploadProductImage = (file: File): Promise<string> =>
  uploadFile(file, { subdir: "products" });

export const uploadCaseStudyImage = (file: File): Promise<string> =>
  uploadFile(file, { subdir: "case-studies" });

export const uploadPartnerLogo = (file: File): Promise<string> =>
  uploadFile(file, { subdir: "partners" });

export const uploadTestimonialImage = (file: File): Promise<string> =>
  uploadFile(file, { subdir: "testimonials" });

export const uploadProfileHeadshot = (file: File): Promise<string> =>
  uploadFile(file, { subdir: "profiles" });

export const uploadOrgHeadshot = (file: File): Promise<string> =>
  uploadFile(file, { subdir: "org" });

export const uploadSocialIcon = (file: File): Promise<string> =>
  uploadFile(file, { subdir: "socials" });

export const uploadUserAvatar = (file: File): Promise<string> =>
  uploadFile(file, { subdir: "users" });

export const uploadVacancyFeaturedImage = (file: File): Promise<string> =>
  uploadFile(file, { subdir: "vacancies" });

export const uploadVacancyResume = (file: File): Promise<string> =>
  uploadFile(file, {
    subdir: "vacancy-applications",
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimes: [...DOCUMENT_MIME_TYPES],
  });
