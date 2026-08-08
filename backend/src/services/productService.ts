import { PrismaClient, Product, Prisma } from '@prisma/client';
import { CreateProductInput, UpdateProductInput } from '../validators/productValidator';

const prisma = new PrismaClient();

export interface GetProductsQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  category?: string;
  warehouseLocation?: string;
  lowStock?: string | boolean;
}

export interface PaginatedProductsResult {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductOperationResult {
  success: boolean;
  isDuplicateSku?: boolean;
  message?: string;
  data?: Product;
}

/**
 * Creates a new Product in the database with duplicate SKU check.
 */
export const createProductService = async (
  input: CreateProductInput,
  userId: string
): Promise<ProductOperationResult> => {
  const normalizedSku = input.sku!.trim().toUpperCase();

  // Check for duplicate SKU
  const existingSku = await prisma.product.findUnique({
    where: { sku: normalizedSku }
  });

  if (existingSku) {
    return {
      success: false,
      isDuplicateSku: true,
      message: 'Product SKU already exists'
    };
  }

  const newProduct = await prisma.product.create({
    data: {
      name: input.name!.trim(),
      sku: normalizedSku,
      category: input.category!.trim(),
      unitPrice: new Prisma.Decimal(input.unitPrice!),
      currentStock: parseInt(String(input.currentStock), 10),
      minimumStock: parseInt(String(input.minimumStock), 10),
      warehouseLocation: input.warehouseLocation!.trim(),
      createdById: userId
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  });

  return {
    success: true,
    data: newProduct
  };
};

/**
 * Fetches paginated, searchable, filterable products (including low-stock filter).
 */
export const getProductsService = async (
  queryParams: GetProductsQuery
): Promise<PaginatedProductsResult> => {
  const page = Math.max(1, parseInt(String(queryParams.page || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(queryParams.limit || 10), 10)));
  const skip = (page - 1) * limit;

  const whereClause: Prisma.ProductWhereInput = {};

  // Category filter
  if (queryParams.category && queryParams.category.trim() !== '') {
    whereClause.category = { equals: queryParams.category.trim(), mode: 'insensitive' };
  }

  // Warehouse location filter
  if (queryParams.warehouseLocation && queryParams.warehouseLocation.trim() !== '') {
    whereClause.warehouseLocation = { equals: queryParams.warehouseLocation.trim(), mode: 'insensitive' };
  }

  // Multi-field search
  if (queryParams.search && queryParams.search.trim() !== '') {
    const searchTerm = queryParams.search.trim();
    whereClause.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { sku: { contains: searchTerm, mode: 'insensitive' } },
      { category: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }

  // Low stock filter (currentStock <= minimumStock)
  const isLowStockRequested = queryParams.lowStock === 'true' || queryParams.lowStock === true;

  if (isLowStockRequested) {
    // Execute low-stock query using Prisma raw IDs or findMany
    const lowStockProductIds = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM products WHERE "currentStock" <= "minimumStock"
    `;
    const ids = lowStockProductIds.map(p => p.id);
    whereClause.id = { in: ids };
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where: whereClause }),
    prisma.product.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

/**
 * Retrieves a single product record by unique ID.
 */
export const getProductByIdService = async (id: string): Promise<Product | null> => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  });
};

/**
 * Updates an existing product's details (excluding currentStock).
 */
export const updateProductService = async (
  id: string,
  input: UpdateProductInput
): Promise<ProductOperationResult> => {
  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) {
    return {
      success: false,
      message: 'Product not found'
    };
  }

  const updateData: Prisma.ProductUpdateInput = {};

  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.category !== undefined) updateData.category = input.category.trim();
  if (input.warehouseLocation !== undefined) updateData.warehouseLocation = input.warehouseLocation.trim();
  if (input.unitPrice !== undefined) updateData.unitPrice = new Prisma.Decimal(input.unitPrice);
  if (input.minimumStock !== undefined) updateData.minimumStock = parseInt(String(input.minimumStock), 10);

  // Check SKU uniqueness if SKU is being changed
  if (input.sku !== undefined) {
    const normalizedSku = input.sku.trim().toUpperCase();
    if (normalizedSku !== existingProduct.sku) {
      const skuCollision = await prisma.product.findFirst({
        where: {
          sku: normalizedSku,
          NOT: { id }
        }
      });

      if (skuCollision) {
        return {
          success: false,
          isDuplicateSku: true,
          message: 'Product SKU already exists'
        };
      }
      updateData.sku = normalizedSku;
    }
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  });

  return {
    success: true,
    data: updatedProduct
  };
};
