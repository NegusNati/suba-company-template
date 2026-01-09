import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import type { EditorState, SerializedEditorState } from "lexical";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

const editorNodes = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  CodeNode,
  CodeHighlightNode,
];

const editorTheme = {
  paragraph: "mb-2",
  quote: "border-l-2 border-primary/40 pl-4 italic text-muted-foreground",
  heading: {
    h1: "text-3xl font-bold",
    h2: "text-2xl font-semibold",
    h3: "text-xl font-semibold",
    h4: "text-lg font-medium",
    h5: "text-base font-medium",
    h6: "text-base font-medium",
  },
  list: {
    nested: {
      listitem: "mb-1",
    },
    ol: "list-decimal pl-6 mb-2 space-y-1",
    ul: "list-disc pl-6 mb-2 space-y-1",
    listitem: "mb-1",
  },
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "rounded bg-muted px-1 py-0.5 font-mono text-sm",
  },
  table: "w-full border-collapse",
  tableCell: "border border-border px-2 py-1 align-top",
  tableRow: "border border-border",
  code: "rounded-md bg-muted px-2 py-1 font-mono text-sm",
};

const fallbackSerializedState = JSON.stringify({
  root: {
    type: "root",
    version: 1,
    indent: 0,
    format: "",
    direction: "ltr",
    children: [
      {
        type: "paragraph",
        version: 1,
        indent: 0,
        format: "",
        direction: "ltr",
        children: [
          {
            type: "text",
            version: 1,
            text: "",
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
          },
        ],
      },
    ],
  },
});

interface EditorProps {
  editorSerializedState: SerializedEditorState | string | undefined;
  onSerializedChange?: (state: SerializedEditorState) => void;
  placeholder?: string;
  className?: string;
}

function Placeholder({ placeholder }: { placeholder: string }) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 text-sm text-muted-foreground">
      {placeholder}
    </div>
  );
}

export function Editor({
  editorSerializedState,
  onSerializedChange,
  placeholder = "Write something...",
  className,
}: EditorProps) {
  const initialState = useMemo(() => {
    if (!editorSerializedState) return fallbackSerializedState;
    return typeof editorSerializedState === "string"
      ? editorSerializedState
      : JSON.stringify(editorSerializedState);
  }, [editorSerializedState]);

  const composerKey = useMemo(() => initialState, [initialState]);

  return (
    <LexicalComposer
      key={composerKey}
      initialConfig={{
        namespace: "dashboard-editor",
        editable: true,
        editorState: initialState,
        nodes: editorNodes,
        theme: editorTheme,
        onError(error) {
          // Rethrow so React ErrorBoundary (if present) catches it
          throw error;
        },
      }}
    >
      <div
        className={cn(
          "relative rounded-md border border-input bg-background",
          className,
        )}
      >
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={cn(
                "prose prose-gray max-w-none min-h-[220px] px-4 py-3 text-base focus:outline-none",
                "dark:prose-invert",
              )}
            />
          }
          placeholder={<Placeholder placeholder={placeholder} />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <OnChangePlugin
          onChange={(editorState: EditorState) => {
            editorState.read(() => {
              const serialized = editorState.toJSON() as SerializedEditorState;
              onSerializedChange?.(serialized);
            });
          }}
        />
      </div>
    </LexicalComposer>
  );
}
