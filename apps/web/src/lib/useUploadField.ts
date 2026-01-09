import { useCallback, useEffect, useMemo, useState } from "react";

import { ACCEPTED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from "./forms";

type UseUploadFieldOptions = {
  accept?: string[]; // mime types
  maxSize?: number; // bytes
  multiple?: boolean;
  initialUrls?: string[];
};

type UploadValidationResult = {
  errors: string[];
  files: File[];
};

export function useUploadField(options: UseUploadFieldOptions = {}) {
  const {
    accept = [...ACCEPTED_IMAGE_MIME_TYPES],
    maxSize = MAX_IMAGE_SIZE_BYTES,
    multiple = true,
    initialUrls = [],
  } = options;
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(initialUrls);

  const revokePreviews = useCallback((urls: string[]) => {
    urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    return () => revokePreviews(previews);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previews]);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `${file.name} exceeds the maximum size of ${Math.round(maxSize / 1024)}KB`;
      }
      if (accept && accept.length > 0 && !accept.includes(file.type)) {
        return `${file.name} is not an accepted file type`;
      }
      return null;
    },
    [accept, maxSize],
  );

  const handleFiles = useCallback(
    (incoming: FileList | File[]): UploadValidationResult => {
      const nextFiles: File[] = [];
      const errors: string[] = [];
      const list = Array.from(incoming);

      list.forEach((file, index) => {
        if (!multiple && index > 0) return;
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          nextFiles.push(file);
        }
      });

      // Replace previews and files
      revokePreviews(previews);
      const nextPreviews = nextFiles.map((file) => URL.createObjectURL(file));
      setFiles(nextFiles);
      setPreviews(nextPreviews);

      return { errors, files: nextFiles };
    },
    [multiple, previews, revokePreviews, validateFile],
  );

  const reset = useCallback(() => {
    revokePreviews(previews);
    setFiles([]);
    setPreviews(initialUrls);
  }, [initialUrls, previews, revokePreviews]);

  return useMemo(
    () => ({
      files,
      previews,
      setFiles,
      setPreviews,
      handleFiles,
      reset,
    }),
    [files, handleFiles, previews, reset],
  );
}
