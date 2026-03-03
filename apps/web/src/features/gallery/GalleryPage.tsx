import { ChevronLeft, ChevronRight, Images, Tag } from "lucide-react";
import { useMemo, useState } from "react";

import { AppImage } from "@/components/common/AppImage";
import { ContactCTASection } from "@/components/common/ContactCTASection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_BASE_URL } from "@/lib/api-base";
import {
  usePublicGalleryCategoriesQuery,
  usePublicGalleryQuery,
} from "@/lib/gallery";

type FlattenedGalleryImage = {
  imageUrl: string;
  imageIndex: number;
  entryId: number;
  title: string;
  description: string | null;
  occurredAt: string | null;
  categoryName: string;
  categorySlug: string;
};

const resolveImageUrl = (url: string) => {
  const baseUrl = (API_BASE_URL ?? "").replace(/\/$/, "");
  return url.startsWith("/") ? `${baseUrl}${url}` : url;
};

const formatDate = (value: string | null) => {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
};

export function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const selectedCategorySlug =
    activeCategory === "all" ? undefined : activeCategory;

  const { data: categoriesData, isPending: isCategoriesLoading } =
    usePublicGalleryCategoriesQuery({
      limit: 100,
      sortBy: "name",
      sortOrder: "asc",
    });

  const { data: galleryData, isPending: isGalleryLoading } =
    usePublicGalleryQuery({
      limit: 100,
      sortBy: "occurredAt",
      sortOrder: "desc",
      categorySlug: selectedCategorySlug,
    });

  const categories = categoriesData?.data ?? [];

  const flattenedImages = useMemo<FlattenedGalleryImage[]>(
    () =>
      (galleryData?.data ?? []).flatMap((item) =>
        item.imageUrls.map((imageUrl, imageIndex) => ({
          imageUrl: resolveImageUrl(imageUrl),
          imageIndex,
          entryId: item.id,
          title: item.title,
          description: item.description,
          occurredAt: item.occurredAt,
          categoryName: item.category.name,
          categorySlug: item.category.slug,
        })),
      ),
    [galleryData?.data],
  );

  const activeImage =
    activeImageIndex !== null ? flattenedImages[activeImageIndex] : null;

  const openLightbox = (index: number) => setActiveImageIndex(index);
  const closeLightbox = () => setActiveImageIndex(null);

  const goToPrev = () => {
    if (activeImageIndex === null || flattenedImages.length === 0) return;
    setActiveImageIndex(
      activeImageIndex === 0
        ? flattenedImages.length - 1
        : activeImageIndex - 1,
    );
  };

  const goToNext = () => {
    if (activeImageIndex === null || flattenedImages.length === 0) return;
    setActiveImageIndex(
      activeImageIndex === flattenedImages.length - 1
        ? 0
        : activeImageIndex + 1,
    );
  };

  const isLoading = isCategoriesLoading || isGalleryLoading;

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="max-w-2xl space-y-4">
            <Badge variant="secondary" className="gap-2">
              <Images className="h-4 w-4" />
              Gallery
            </Badge>
            <h1 className="text-4xl font-serif tracking-tight text-foreground md:text-5xl">
              Moments From Our Work
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Explore our event highlights, team snapshots, and
              behind-the-scenes moments. Browse by category and open any image
              for full details.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-6 py-10 content-auto">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="all" className="rounded-full px-4 py-2">
              All
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.slug}
                className="rounded-full px-4 py-2"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`gallery-skeleton-${index}`}
                className="aspect-square animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : flattenedImages.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No images available for this category yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {flattenedImages.map((image, index) => (
              <button
                key={`${image.entryId}-${image.imageIndex}-${index}`}
                type="button"
                onClick={() => openLightbox(index)}
                className="group relative aspect-square overflow-hidden rounded-xl border bg-muted"
              >
                <AppImage
                  src={image.imageUrl}
                  alt={image.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-white">
                  <p className="line-clamp-1 text-sm font-medium">
                    {image.title}
                  </p>
                  <p className="line-clamp-1 text-xs text-white/80">
                    {image.categoryName}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={activeImage !== null}
        onOpenChange={(open) => !open && closeLightbox()}
      >
        <DialogContent className="max-h-[90vh] overflow-auto p-0 sm:max-w-5xl">
          {activeImage ? (
            <div className="grid gap-0 md:grid-cols-[1.5fr_1fr]">
              <div className="relative bg-black">
                <AppImage
                  src={activeImage.imageUrl}
                  alt={activeImage.title}
                  className="h-[60vh] w-full object-contain md:h-[80vh]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 left-3 -translate-y-1/2"
                  onClick={goToPrev}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 right-3 -translate-y-1/2"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-5 p-6">
                <DialogHeader>
                  <DialogTitle>{activeImage.title}</DialogTitle>
                  <DialogDescription>
                    Image {activeImageIndex !== null ? activeImageIndex + 1 : 1}{" "}
                    of {flattenedImages.length}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span>{activeImage.categoryName}</span>
                  </div>
                  {activeImage.occurredAt && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        Occurred On
                      </p>
                      <p>{formatDate(activeImage.occurredAt)}</p>
                    </div>
                  )}
                  {activeImage.description && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">
                        Description
                      </p>
                      <p className="whitespace-pre-wrap">
                        {activeImage.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ContactCTASection />
    </div>
  );
}
