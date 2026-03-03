import { useNavigate } from "@tanstack/react-router";
import { FolderOpen, Images, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { Columns as GalleryColumns } from "./columns";
import {
  useDeleteGalleryItemMutation,
  useGalleryItemsQuery,
  type GalleryItem,
} from "./lib";
import { CreateResourceModal } from "../components/CreateResourceModal";
import { DeleteDialog } from "../components/deletedialog";
import { DataTable } from "../components/table/DataTable";
import { CategoryForm } from "../gallery-categories/CategoryForm";
import { Columns as CategoryColumns } from "../gallery-categories/columns";
import {
  useDeleteGalleryCategoryMutation,
  useGalleryCategoriesQuery,
  type GalleryCategory,
} from "../gallery-categories/lib";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type GalleryDashboardTab = "entries" | "categories";

interface GalleryDashboardProps {
  initialTab?: GalleryDashboardTab;
}

export default function GalleryDashboard({
  initialTab = "entries",
}: GalleryDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<GalleryDashboardTab>(initialTab);

  const [entryPage, setEntryPage] = useState(1);
  const [entryPageSize, setEntryPageSize] = useState(10);
  const [entrySearch, setEntrySearch] = useState("");
  const [debouncedEntrySearch] = useDebounce(entrySearch, 300);

  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryPageSize, setCategoryPageSize] = useState(10);
  const [categorySearch, setCategorySearch] = useState("");
  const [debouncedCategorySearch] = useDebounce(categorySearch, 300);

  const [entryDeleteOpen, setEntryDeleteOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<GalleryItem | null>(null);

  const [isCategoryViewOpen, setIsCategoryViewOpen] = useState(false);
  const [isCategoryEditOpen, setIsCategoryEditOpen] = useState(false);
  const [isCategoryCreateOpen, setIsCategoryCreateOpen] = useState(false);
  const [isCategoryDeleteOpen, setIsCategoryDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<GalleryCategory | null>(null);

  const {
    data: galleryData,
    isPending: isEntriesPending,
    isError: isEntriesError,
    error: entriesError,
  } = useGalleryItemsQuery({
    page: entryPage,
    limit: entryPageSize,
    search: debouncedEntrySearch || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const {
    data: categoriesData,
    isPending: isCategoriesPending,
    isError: isCategoriesError,
    error: categoriesError,
  } = useGalleryCategoriesQuery({
    page: categoryPage,
    limit: categoryPageSize,
    search: debouncedCategorySearch || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const deleteGalleryMutation = useDeleteGalleryItemMutation({
    onSuccess: () => {
      toast.success("Gallery entry deleted successfully.");
      setEntryDeleteOpen(false);
      setEntryToDelete(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete gallery entry: ${error.message}`);
    },
  });

  const deleteCategoryMutation = useDeleteGalleryCategoryMutation({
    onSuccess: () => {
      toast.success("Gallery category deleted successfully.");
      setIsCategoryDeleteOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete gallery category: ${error.message}`);
    },
  });

  const galleryItems = galleryData?.data ?? [];
  const categoryItems = categoriesData?.data ?? [];

  const galleryPagination = galleryData?.meta?.pagination
    ? {
        pageCount: galleryData.meta.pagination.totalPages,
        pageIndex: galleryData.meta.pagination.page - 1,
        pageSize: galleryData.meta.pagination.limit,
        onPageChange: setEntryPage,
        onPageSizeChange: (size: number) => {
          setEntryPageSize(size);
          setEntryPage(1);
        },
      }
    : undefined;

  const categoryPagination = categoriesData?.meta?.pagination
    ? {
        pageCount: categoriesData.meta.pagination.totalPages,
        pageIndex: categoriesData.meta.pagination.page - 1,
        pageSize: categoriesData.meta.pagination.limit,
        onPageChange: setCategoryPage,
        onPageSizeChange: (size: number) => {
          setCategoryPageSize(size);
          setCategoryPage(1);
        },
      }
    : undefined;

  const handleEntryView = (item: GalleryItem) => {
    navigate({ to: "/dashboard/gallery/$id", params: { id: String(item.id) } });
  };

  const handleEntryEdit = (item: GalleryItem) => {
    navigate({
      to: "/dashboard/gallery/$id/edit",
      params: { id: String(item.id) },
    });
  };

  const handleEntryDelete = (item: GalleryItem) => {
    setEntryToDelete(item);
    setEntryDeleteOpen(true);
  };

  const handleCategoryView = (category: GalleryCategory) => {
    setSelectedCategory(category);
    setIsCategoryViewOpen(true);
  };

  const handleCategoryEdit = (category: GalleryCategory) => {
    setSelectedCategory(category);
    setIsCategoryEditOpen(true);
  };

  const handleCategoryDelete = (category: GalleryCategory) => {
    if (category.isSystem) return;
    setSelectedCategory(category);
    setIsCategoryDeleteOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryCreateOpen(false);
    setIsCategoryEditOpen(false);
    setIsCategoryViewOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "entries" ? (
            <>
              <Button
                variant="outline"
                onClick={() => setActiveTab("categories")}
                className="gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                Manage Categories
              </Button>
              <Button
                onClick={() => navigate({ to: "/dashboard/gallery/create" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setActiveTab("entries")}
                className="gap-2"
              >
                <Images className="h-4 w-4" />
                Back to Gallery
              </Button>
              <Button onClick={() => setIsCategoryCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as GalleryDashboardTab)}
        className="mb-6"
      >
        <TabsList className="bg-muted/60">
          <TabsTrigger value="entries">Entries</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "entries" ? (
        <DataTable
          columns={GalleryColumns(
            handleEntryView,
            handleEntryEdit,
            handleEntryDelete,
          )}
          data={galleryItems}
          pagination={galleryPagination}
          isLoading={isEntriesPending}
          isError={isEntriesError}
          error={entriesError}
          searchKey="title"
          searchValue={entrySearch}
          onSearchChange={(value) => {
            setEntrySearch(value);
            setEntryPage(1);
          }}
        />
      ) : (
        <DataTable
          columns={CategoryColumns(
            handleCategoryView,
            handleCategoryEdit,
            handleCategoryDelete,
          )}
          data={categoryItems}
          pagination={categoryPagination}
          isLoading={isCategoriesPending}
          isError={isCategoriesError}
          error={categoriesError}
          searchKey="name"
          searchValue={categorySearch}
          onSearchChange={(value) => {
            setCategorySearch(value);
            setCategoryPage(1);
          }}
        />
      )}

      <DeleteDialog
        isOpen={entryDeleteOpen}
        onClose={() => setEntryDeleteOpen(false)}
        onDelete={() =>
          entryToDelete && deleteGalleryMutation.mutate(entryToDelete.id)
        }
        isDeleting={deleteGalleryMutation.isPending}
      />

      <CreateResourceModal
        isOpen={isCategoryCreateOpen}
        onClose={closeCategoryModal}
        title="Add Gallery Category"
      >
        <CategoryForm mode="create" onClose={closeCategoryModal} />
      </CreateResourceModal>

      <CreateResourceModal
        isOpen={isCategoryEditOpen}
        onClose={closeCategoryModal}
        title="Edit Gallery Category"
      >
        <CategoryForm
          mode="edit"
          category={selectedCategory}
          onClose={closeCategoryModal}
        />
      </CreateResourceModal>

      <CreateResourceModal
        isOpen={isCategoryViewOpen}
        onClose={closeCategoryModal}
        title="View Gallery Category"
      >
        <CategoryForm
          mode="view"
          category={selectedCategory}
          onClose={closeCategoryModal}
        />
      </CreateResourceModal>

      <DeleteDialog
        isOpen={isCategoryDeleteOpen}
        onClose={() => setIsCategoryDeleteOpen(false)}
        onDelete={() => {
          if (!selectedCategory || selectedCategory.isSystem) return;
          deleteCategoryMutation.mutate(selectedCategory.id);
        }}
        isDeleting={deleteCategoryMutation.isPending}
      />
    </div>
  );
}
