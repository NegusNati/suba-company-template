declare module "react-colorful" {
  import type * as React from "react";

  export interface HexColorPickerProps {
    color: string;
    onChange?: (color: string) => void;
    className?: string;
    style?: React.CSSProperties;
  }

  export const HexColorPicker: React.FC<HexColorPickerProps>;
}

declare module "@lexical/file" {
  import type { EditorState, LexicalEditor } from "lexical";

  export interface SerializedDocument {
    editorState: unknown;
    source?: string;
    [key: string]: unknown;
  }

  export interface ExportOptions {
    fileName?: string;
    source?: string;
  }

  export function exportFile(
    editor: LexicalEditor,
    options?: ExportOptions,
  ): Promise<void>;

  export function importFile(editor: LexicalEditor): Promise<void>;

  export function serializedDocumentFromEditorState(
    editorState: EditorState,
    meta?: { source?: string },
  ): SerializedDocument;

  export function editorStateFromSerializedDocument(
    editor: LexicalEditor,
    doc: SerializedDocument,
  ): EditorState;
}
