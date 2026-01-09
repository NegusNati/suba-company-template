import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ParagraphNode, TextNode } from "lexical";
import type { Klass, LexicalNode } from "lexical";

import { ImageNode } from "./ImageNode";
import { VideoNode } from "./VideoNode";

export const NODES: Array<Klass<LexicalNode>> = [
  ParagraphNode,
  TextNode,
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  LinkNode,
  AutoLinkNode,
  HashtagNode,
  ImageNode,
  VideoNode,
];

export function createEditorConfig(namespace: string, editable: boolean) {
  return {
    namespace,
    editable,
    theme: {
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
    },
    nodes: NODES,
    onError(error: unknown) {
      throw error;
    },
  };
}
