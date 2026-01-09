import type { ProductRepository } from "./repository";
import type {
  ProductQuery,
  CreateProductInput,
  UpdateProductInput,
  PublicProductQuery,
} from "./validators";
import { NotFoundError, ConflictError } from "../../core/http";

export const createProductService = (repository: ProductRepository) => ({
  async getProducts(query: ProductQuery) {
    return repository.findAll(query);
  },

  async getProduct(id: number) {
    const product = await repository.findById(id);
    if (!product) throw new NotFoundError(`Product ${id} not found`);
    return product;
  },

  async getProductWithRelations(id: number) {
    const product = await repository.findWithRelations(id);
    if (!product) throw new NotFoundError(`Product ${id} not found`);
    return product;
  },

  async createProduct(data: CreateProductInput) {
    try {
      return await repository.create(data);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("unique constraint")
      ) {
        throw new ConflictError(`Product with slug already exists`);
      }
      throw error;
    }
  },

  async updateProduct(id: number, data: UpdateProductInput) {
    const existing = await repository.findById(id);
    if (!existing) throw new NotFoundError(`Product ${id} not found`);

    try {
      return await repository.update(id, data);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("unique constraint")
      ) {
        throw new ConflictError("Product slug already exists");
      }
      throw error;
    }
  },

  async deleteProduct(id: number) {
    const existing = await repository.findById(id);
    if (!existing) throw new NotFoundError(`Product ${id} not found`);
    await repository.delete(id);
    return { message: "Product deleted" };
  },

  async getPublicProducts(query: PublicProductQuery) {
    const clampedQuery = {
      ...query,
      limit: Math.min(query.limit, 50),
    };
    return repository.findPublicList(clampedQuery);
  },

  async getPublicProductBySlug(slug: string) {
    const product = await repository.findBySlugWithRelations(slug);
    if (!product) throw new NotFoundError(`Product not found`);
    return product;
  },
});

export type ProductService = ReturnType<typeof createProductService>;
