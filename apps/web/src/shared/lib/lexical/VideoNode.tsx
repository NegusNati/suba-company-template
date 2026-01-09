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

export type VideoPayload = {
  src: string;
  width?: number;
  height?: number;
};

export type SerializedVideoNode = Spread<
  {
    src: string;
    width?: number;
    height?: number;
    type: "passport-video";
    version: 1;
  },
  SerializedLexicalNode
>;

function convertVideoElement(domNode: HTMLElement): DOMConversionOutput | null {
  const video = domNode as HTMLVideoElement;
  const src = video.getAttribute("src");
  if (!src) {
    return null;
  }
  const width = video.width || undefined;
  const height = video.height || undefined;
  const node = $createVideoNode({ src, width, height });
  return { node };
}

export class VideoNode extends DecoratorNode<ReactElement> {
  __src: string;
  __width?: number;
  __height?: number;

  static getType(): string {
    return "passport-video";
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__src, node.__width, node.__height, node.__key);
  }

  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    const { src, width, height } = serializedNode;
    return new VideoNode(src, width, height);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      video: () => ({
        conversion: convertVideoElement,
        priority: 0,
      }),
    };
  }

  constructor(src: string, width?: number, height?: number, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__width = width;
    this.__height = height;
  }

  exportJSON(): SerializedVideoNode {
    return {
      type: "passport-video",
      version: 1,
      src: this.__src,
      width: this.__width,
      height: this.__height,
    };
  }

  exportDOM(): DOMExportOutput {
    const video = document.createElement("video");
    video.setAttribute("src", this.__src);
    video.setAttribute("controls", "true");
    if (this.__width) {
      video.setAttribute("width", String(this.__width));
    }
    if (this.__height) {
      video.setAttribute("height", String(this.__height));
    }
    return { element: video };
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
      <video
        src={this.__src}
        width={this.__width}
        height={this.__height}
        controls
        className="lexical-video rounded-md"
      />
    );
  }
}

export function $createVideoNode(payload: VideoPayload): VideoNode {
  const { src, width, height } = payload;
  return new VideoNode(src, width, height);
}

export function $isVideoNode(node: unknown): node is VideoNode {
  return node instanceof VideoNode;
}
