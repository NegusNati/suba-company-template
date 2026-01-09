import "./lexical.css";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import DOMPurify from "isomorphic-dompurify";
import {
  $getRoot,
  $insertNodes,
  type EditorState,
  type LexicalEditor as LexicalEditorType,
} from "lexical";
import { useEffect, useRef, type MutableRefObject } from "react";

import { GoogleFontsLoader } from "./FontPlugin";
import { ImagesPlugin } from "./ImagesPlugin";
import { MarkdownPastePlugin } from "./MarkdownPastePlugin";
import { TabIndentationPlugin } from "./TabIndentationPlugin";
import { ToolbarPlugin } from "./ToolbarPlugin";

import { createEditorConfig } from "@/shared/lib/lexical/initial-config";
import { PASSPORT_TRANSFORMERS } from "@/shared/lib/lexical/markdown-transformers";

const SANITIZE_CONFIG = {
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
};

const URL_MATCHER =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const MATCHERS = [
  (text: string) => {
    const match = URL_MATCHER.exec(text);
    if (match === null) {
      return null;
    }
    const fullMatch = match[0];
    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      url: fullMatch.startsWith("http") ? fullMatch : `https://${fullMatch}`,
    };
  },
];

type InitialContentPluginProps = {
  value: string;
  format: "html" | "markdown";
  lastSerializedRef: MutableRefObject<string>;
};

function InitialContentPlugin({
  value,
  format,
  lastSerializedRef,
}: InitialContentPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!value) return;
    if (value === lastSerializedRef.current) return;

    editor.update(() => {
      const root = $getRoot();
      root.clear();
      root.select();

      if (format === "markdown") {
        $convertFromMarkdownString(value, PASSPORT_TRANSFORMERS);
        return;
      }

      const parser = new DOMParser();
      const sanitizedHtml = DOMPurify.sanitize(value, SANITIZE_CONFIG);
      const dom = parser.parseFromString(sanitizedHtml, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      $insertNodes(nodes);
    });
    lastSerializedRef.current = value;
  }, [editor, format, lastSerializedRef, value]);

  return null;
}

type LexicalEditorProps = {
  value: string;
  onChange?: (html: string) => void;
  onMarkdownChange?: (markdown: string) => void;
  valueFormat?: "html" | "markdown";
  placeholder?: string;
  readOnly?: boolean;
};

export function LexicalEditor({
  value,
  onChange,
  onMarkdownChange,
  valueFormat = "html",
  placeholder = "Start writing...",
  readOnly = false,
}: LexicalEditorProps) {
  const lastSerializedRef = useRef("");
  const initialConfig = {
    ...createEditorConfig("article-editor", !readOnly),
    editorState: null,
    editable: !readOnly,
  };

  const handleChange = (
    editorState: EditorState,
    editor: LexicalEditorType,
  ) => {
    if (readOnly) return;

    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor);
      const sanitized = DOMPurify.sanitize(html, SANITIZE_CONFIG);
      if (valueFormat === "html") {
        lastSerializedRef.current = sanitized;
      }
      onChange?.(sanitized);

      if (onMarkdownChange) {
        const markdown = $convertToMarkdownString(PASSPORT_TRANSFORMERS);
        if (valueFormat === "markdown") {
          lastSerializedRef.current = markdown;
        }
        onMarkdownChange(markdown);
      }
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <GoogleFontsLoader />
      <div
        className={`relative ${!readOnly ? "border-input bg-background rounded-md border" : ""}`}
      >
        {!readOnly && <ToolbarPlugin />}
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={`lexical-editor ${!readOnly ? "min-h-[240px] px-4 py-3" : ""} resize-none overflow-auto text-sm outline-none`}
              />
            }
            placeholder={
              !readOnly ? (
                <div className="text-muted-foreground pointer-events-none absolute top-3 left-4 text-sm">
                  {placeholder}
                </div>
              ) : null
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <AutoLinkPlugin matchers={MATCHERS} />
          <MarkdownShortcutPlugin transformers={PASSPORT_TRANSFORMERS} />
          <MarkdownPastePlugin />
          <ImagesPlugin />
          <TabIndentationPlugin />
          <OnChangePlugin onChange={handleChange} />
          <InitialContentPlugin
            value={value}
            format={valueFormat}
            lastSerializedRef={lastSerializedRef}
          />
        </div>
      </div>
    </LexicalComposer>
  );
}
