import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $patchStyleText } from "@lexical/selection";
import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  type RangeSelection,
} from "lexical";
import { useCallback, useEffect, type MutableRefObject } from "react";

export const FONT_FAMILY_OPTIONS: { value: string; label: string }[] = [
  { value: "inherit", label: "Default" },
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "'Lato', sans-serif", label: "Lato" },
  { value: "'Montserrat', sans-serif", label: "Montserrat" },
  { value: "'Poppins', sans-serif", label: "Poppins" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "'Merriweather', serif", label: "Merriweather" },
  { value: "'Georgia', serif", label: "Georgia" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "'Source Code Pro', monospace", label: "Source Code Pro" },
  { value: "'Fira Code', monospace", label: "Fira Code" },
  { value: "'Courier New', monospace", label: "Courier New" },
];

export const FONT_SIZE_OPTIONS: { value: string; label: string }[] = [
  { value: "10px", label: "10" },
  { value: "12px", label: "12" },
  { value: "14px", label: "14" },
  { value: "16px", label: "16" },
  { value: "18px", label: "18" },
  { value: "20px", label: "20" },
  { value: "24px", label: "24" },
  { value: "28px", label: "28" },
  { value: "32px", label: "32" },
  { value: "36px", label: "36" },
  { value: "48px", label: "48" },
  { value: "64px", label: "64" },
  { value: "72px", label: "72" },
];

// Google Fonts that need to be loaded
export const GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Playfair Display",
  "Merriweather",
  "Source Code Pro",
  "Fira Code",
];

function getSelectionForStyle(
  selectionRef?: MutableRefObject<RangeSelection | null>,
) {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    return selection;
  }
  if (selectionRef?.current) {
    const clonedSelection = selectionRef.current.clone();
    $setSelection(clonedSelection);
    return clonedSelection;
  }
  return null;
}

export function useFont(
  selectionRef?: MutableRefObject<RangeSelection | null>,
) {
  const [editor] = useLexicalComposerContext();

  const applyFontFamily = useCallback(
    (fontFamily: string) => {
      editor.update(() => {
        const selection = getSelectionForStyle(selectionRef);
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            "font-family": fontFamily === "inherit" ? null : fontFamily,
          });
        }
      });
    },
    [editor, selectionRef],
  );

  const applyFontSize = useCallback(
    (fontSize: string) => {
      editor.update(() => {
        const selection = getSelectionForStyle(selectionRef);
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            "font-size": fontSize,
          });
        }
      });
    },
    [editor, selectionRef],
  );

  return { applyFontFamily, applyFontSize };
}

// Component to load Google Fonts into document head
export function GoogleFontsLoader() {
  useEffect(() => {
    const fontsQuery = GOOGLE_FONTS.map(
      (font) => `family=${font.replace(/ /g, "+")}:wght@400;500;600;700`,
    ).join("&");
    const href = `https://fonts.googleapis.com/css2?${fontsQuery}&display=swap`;

    // Check if already loaded
    const existingLink = document.querySelector(
      `link[href="${href}"]`,
    ) as HTMLLinkElement | null;
    if (existingLink) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);

    return () => {
      // Don't remove on cleanup - fonts should persist
    };
  }, []);

  return null;
}
