import {
  ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  type Transformer,
} from "@lexical/markdown";

// Export all standard markdown transformers
// These include: heading, quote, code, unordered list, ordered list, bold, italic, strikethrough, inline code, link, etc.
export const PASSPORT_TRANSFORMERS: Transformer[] = [
  ...ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
];
