import { useProductByIdQuery } from "../lib/products-query";
import type { UpdateProduct } from "../lib/products-schema";
import { ProductForm } from "../ProductForm";

interface ProductEditProps {
  productId: number;
}

export default function ProductEdit({ productId }: ProductEditProps) {
  const { data, isPending, isError, error } = useProductByIdQuery(productId);

  if (isPending) {
    return <div className="p-8">Loading product...</div>;
  }

  if (isError || !data?.data) {
    return (
      <div className="p-8 text-destructive">
        Failed to load product{error ? `: ${error.message}` : ""}
      </div>
    );
  }

  const product = data.data;

  const initialData: UpdateProduct = {
    id: product.id,
    title: product.title,
    description: product.description ?? "",
    overview: product.overview ?? null,
    productLink: product.productLink ?? null,
    tagIds: product.tags?.map((tag) => tag.id) ?? [],
    existingImages: product.images ?? [],
  };

  return <ProductForm mode="edit" initialData={initialData} />;
}
