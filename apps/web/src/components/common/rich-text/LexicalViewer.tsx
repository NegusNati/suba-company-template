import "./lexical.css";

import DOMPurify from "isomorphic-dompurify";

import { GoogleFontsLoader } from "./FontPlugin";

const normalizeHtml = (rawHtml: string) => {
  if (!rawHtml) return rawHtml;
  if (rawHtml.includes("<")) return rawHtml;
  if (!rawHtml.includes("&lt;")) return rawHtml;
  const parsed = new DOMParser().parseFromString(rawHtml, "text/html");
  return parsed.documentElement.textContent ?? rawHtml;
};

const sanitizeContent = (html: string) =>
  DOMPurify.sanitize(normalizeHtml(html), {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "code",
      "pre",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "img",
      "video",
      "source",
      "span",
    ],
    ALLOWED_ATTR: [
      "href",
      "rel",
      "target",
      "src",
      "alt",
      "width",
      "height",
      "controls",
      "preload",
      "style",
    ],
    ALLOW_DATA_ATTR: false,
    ADD_URI_SAFE_ATTR: ["src"],
  });

type LexicalViewerProps = {
  content: string;
};

export function LexicalViewer({ content }: LexicalViewerProps) {
  if (!content) {
    return <p className="text-muted-foreground">No content.</p>;
  }

  const sanitizedHtml = sanitizeContent(content);

  return (
    <>
      <GoogleFontsLoader />
      <div
        className="lexical-viewer prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </>
  );
}
