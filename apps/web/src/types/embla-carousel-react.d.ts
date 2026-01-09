declare module "embla-carousel-react" {
  export type EmblaEventHandler = (
    carousel: EmblaCarouselType,
    ...args: unknown[]
  ) => void;

  export type EmblaCarouselType = {
    canScrollPrev(): boolean;
    canScrollNext(): boolean;
    scrollPrev(): void;
    scrollNext(): void;
    selectedScrollSnap(): number;
    scrollTo(index: number): void;
    on(event: string, handler: EmblaEventHandler): void;
    off(event: string, handler: EmblaEventHandler): void;
  };

  export type UseEmblaCarouselType = [
    (node: HTMLElement | null) => void,
    EmblaCarouselType | undefined,
  ];

  export default function useEmblaCarousel(
    options?: Record<string, unknown>,
    plugins?: unknown[],
  ): UseEmblaCarouselType;
}
