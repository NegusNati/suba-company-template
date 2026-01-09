import type { SerializedEditorState } from "lexical";

export function isEditorContentValid(value: unknown): boolean {
  try {
    const editor = value as SerializedEditorState;
    // Example: check if editor has any text content
    return !!editor && !!editor.root?.children?.length;
  } catch {
    return false;
  }
}

// Helper function to check if editor has actual text content
export function hasEditorContent(state: SerializedEditorState): boolean {
  if (!isEditorContentValid(state)) return false;

  // Check if any of the children nodes have actual text
  const checkNode = (node: unknown): boolean => {
    if (typeof node === "object" && node !== null) {
      const nodeObj = node as Record<string, unknown>;
      if (
        "text" in nodeObj &&
        typeof nodeObj.text === "string" &&
        nodeObj.text.trim().length > 0
      ) {
        return true;
      }
      if ("children" in nodeObj && Array.isArray(nodeObj.children)) {
        return nodeObj.children.some(checkNode);
      }
    }
    return false;
  };

  return state.root?.children?.some(checkNode) || false;
}
