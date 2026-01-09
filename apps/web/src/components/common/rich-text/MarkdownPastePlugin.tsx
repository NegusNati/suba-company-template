import { $convertFromMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
} from "lexical";
import { useEffect } from "react";

import { PASSPORT_TRANSFORMERS } from "@/shared/lib/lexical/markdown-transformers";

// Heuristic: only hijack plain-text pastes that look like Markdown to avoid
// mangling normal text. We ignore pastes that already include HTML content.
const MARKDOWN_HINT_REGEX =
  /(^(#{1,6}\s)|(^>\s)|(^[-*+]\s)|(^\d+\.\s)|(```)|(!\[[^\]]*\]\([^)]*\))|(\[[^\]]+\]\([^)]*\))|(~~.+~~)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(__[^_]+__)|(_[^_]+_))/m;

export function MarkdownPastePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<ClipboardEvent | null>(
      PASTE_COMMAND,
      (event) => {
        if (!event) return false;

        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const html = clipboardData.getData("text/html");
        const text = clipboardData.getData("text/plain");

        // Only intercept plain text that looks like Markdown
        if (!text || html || !MARKDOWN_HINT_REGEX.test(text)) {
          return false;
        }

        event.preventDefault();

        editor.update(() => {
          const selection = $getSelection();

          // If we have a selection and it's in the middle of content,
          // we need to handle this more carefully
          if ($isRangeSelection(selection) && !selection.isCollapsed()) {
            // Remove selected content first
            selection.removeText();
          }

          // Clear and convert - $convertFromMarkdownString replaces content
          const root = $getRoot();
          root.clear();
          $convertFromMarkdownString(text, PASSPORT_TRANSFORMERS);
        });

        return true;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return null;
}
