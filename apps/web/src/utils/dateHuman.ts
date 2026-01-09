export function humanizeDate(
  isoString: string | null | undefined,
  dateOnly?: boolean,
): string {
  // Handle null, undefined, or empty string cases
  if (!isoString || typeof isoString !== "string") {
    return "N/A";
  }

  const date = new Date(isoString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "N/A";
  }

  let options: Intl.DateTimeFormatOptions;
  if (dateOnly) {
    options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
  } else {
    options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
  }

  return date.toLocaleString(undefined, options);
}
