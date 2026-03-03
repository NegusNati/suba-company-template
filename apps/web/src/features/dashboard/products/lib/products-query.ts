import type { ApiSuccessResponse } from "@suba-company-template/types/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  createProduct,
  deleteProduct,
  fetchProductById,
  fetchProducts,
  updateProduct,
  type DeleteProductResponse,
} from "./products-api";
import {
  normalizeProductsListParams,
  type CreateProductInput,
  type Product,
  type ProductsListParams,
  type UpdateProductInput,
} from "./products-schema";

import { AUTH_API_ENDPOINTS } from "@/lib/API_ENDPOINTS";

export const productKeys = {
  all: [AUTH_API_ENDPOINTS.PRODUCTS] as const,
  list: (params: ProductsListParams) =>
    [AUTH_API_ENDPOINTS.PRODUCTS, params] as const,
  detail: (id: number | string) =>
    [`${AUTH_API_ENDPOINTS.PRODUCTS}/${id}`] as const,
};

export const useProductsQuery = (
  params?: Partial<ProductsListParams>,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Product[]>, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const normalizedParams = normalizeProductsListParams(params ?? {});

  return useQuery<ApiSuccessResponse<Product[]>, Error>({
    queryKey: productKeys.list(normalizedParams),
    queryFn: () => fetchProducts(normalizedParams),
    ...options,
  });
};

export const useProductByIdQuery = (
  id: number | string,
  options?: Omit<
    UseQueryOptions<ApiSuccessResponse<Product>, Error>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery<ApiSuccessResponse<Product>, Error>({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProductById(id),
    enabled: Boolean(id),
    ...options,
  });

type CreateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Product>, Error, CreateProductInput>,
  "mutationFn"
>;

export const useCreateProductMutation = (options?: CreateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Product>, Error, CreateProductInput>({
    mutationFn: createProduct,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type UpdateVariables = {
  id: number | string;
  payload: UpdateProductInput;
};

type UpdateMutationOptions = Omit<
  UseMutationOptions<ApiSuccessResponse<Product>, Error, UpdateVariables>,
  "mutationFn"
>;

export const useUpdateProductMutation = (options?: UpdateMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<ApiSuccessResponse<Product>, Error, UpdateVariables>({
    mutationFn: ({ id, payload }) => updateProduct(id, payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};

type DeleteMutationOptions = Omit<
  UseMutationOptions<DeleteProductResponse, Error, number | string>,
  "mutationFn"
>;

export const useDeleteProductMutation = (options?: DeleteMutationOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...rest } = options || {};

  return useMutation<DeleteProductResponse, Error, number | string>({
    mutationFn: deleteProduct,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      onSuccess?.(...args);
    },
    onError,
    ...rest,
  });
};
