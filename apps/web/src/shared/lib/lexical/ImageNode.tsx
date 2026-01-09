import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { DecoratorNode } from "lexical";
import type { ReactElement } from "react";

export type ImagePayload = {
  src: string;
  altText?: string;
  width?: number;
  height?: number;
};

export type SerializedImageNode = Spread<
  {
    src: string;
    altText?: string;
    width?: number;
    height?: number;
    type: "passport-image";
    version: 1;
  },
  SerializedLexicalNode
>;

function convertImageElement(domNode: HTMLElement): DOMConversionOutput | null {
  const img = domNode as HTMLImageElement;
  const src = img.getAttribute("src");
  if (!src) {
    return null;
  }
  const altText = img.getAttribute("alt") || undefined;
  const width = img.width || undefined;
  const height = img.height || undefined;
  const node = $createImageNode({ src, altText, width, height });
  return { node };
}

export class ImageNode extends DecoratorNode<ReactElement> {
  __src: string;
  __altText?: string;
  __width?: number;
  __height?: number;

  static getType(): string {
    return "passport-image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText, width, height } = serializedNode;
    return new ImageNode(src, altText, width, height);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(
    src: string,
    altText?: string,
    width?: number,
    height?: number,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
  }

  exportJSON(): SerializedImageNode {
    return {
      type: "passport-image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
    };
  }

  exportDOM(): DOMExportOutput {
    const img = document.createElement("img");
    img.setAttribute("src", this.__src);
    if (this.__altText) {
      img.setAttribute("alt", this.__altText);
    }
    if (this.__width) {
      img.setAttribute("width", String(this.__width));
    }
    if (this.__height) {
      img.setAttribute("height", String(this.__height));
    }
    return { element: img };
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    return span;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): ReactElement {
    return (
      <img
        src={this.__src}
        alt={this.__altText}
        width={this.__width}
        height={this.__height}
        className="lexical-image rounded-md"
      />
    );
  }
}

export function $createImageNode(payload: ImagePayload): ImageNode {
  const { src, altText, width, height } = payload;
  return new ImageNode(src, altText, width, height);
}

export function $isImageNode(node: unknown): node is ImageNode {
  return node instanceof ImageNode;
}
