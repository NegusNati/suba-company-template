import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import type { SerializedEditorState } from "lexical";
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

interface ReadOnlyEditorProps {
  content: SerializedEditorState | string;
  className?: string;
}

export function ReadOnlyEditor({ content, className }: ReadOnlyEditorProps) {
  const initialState = useMemo(() => {
    return typeof content === "string" ? content : JSON.stringify(content);
  }, [content]);

  const composerKey = useMemo(() => initialState, [initialState]);

  return (
    <LexicalComposer
      key={composerKey}
      initialConfig={{
        namespace: "dashboard-editor-readonly",
        editable: false,
        nodes: editorNodes,
        theme: editorTheme,
        editorState: initialState,
        onError(error) {
          throw error;
        },
      }}
    >
      <div className={cn("rounded-md border border-transparent", className)}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="prose prose-gray max-w-none px-1 py-0 text-base dark:prose-invert" />
          }
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      </div>
    </LexicalComposer>
  );
}
