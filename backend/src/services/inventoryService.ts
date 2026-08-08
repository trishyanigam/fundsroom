import { PrismaClient, StockMovement, MovementType, Prisma } from '@prisma/client';
import { CreateStockMovementInput } from '../validators/inventoryValidator';

const prisma = new PrismaClient();

export interface GetStockMovementsQuery {
  page?: string | number;
  limit?: string | number;
  productId?: string;
  movementType?: MovementType;
  fromDate?: string;
  toDate?: string;
}

export interface PaginatedMovementsResult {
  data: StockMovement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MovementOperationResult {
  success: boolean;
  isNotFound?: boolean;
  isInsufficientStock?: boolean;
  message?: string;
  data?: StockMovement;
}

/**
 * Creates a Stock Movement and updates Product stock inside an interactive transaction.
 */
export const createStockMovementService = async (
  input: CreateStockMovementInput,
  userId: string
): Promise<MovementOperationResult> => {
  const { productId, movementType, reason } = input;
  const quantity = parseInt(String(input.quantity), 10);

  return await prisma.$transaction(async (tx) => {
    // 1. Verify Product exists
    const product = await tx.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return {
        success: false,
        isNotFound: true,
        message: 'Product not found.'
      };
    }

    // 2. Handle OUT movement stock check
    if (movementType === MovementType.OUT) {
      if (product.currentStock < quantity) {
        return {
          success: false,
          isInsufficientStock: true,
          message: `Insufficient stock available. Current stock: ${product.currentStock}, requested OUT: ${quantity}.`
        };
      }

      // Decrement stock
      await tx.product.update({
        where: { id: productId },
        data: {
          currentStock: { decrement: quantity }
        }
      });
    } else if (movementType === MovementType.IN) {
      // Increment stock
      await tx.product.update({
        where: { id: productId },
        data: {
          currentStock: { increment: quantity }
        }
      });
    }

    // 3. Create Stock Movement audit log
    const movement = await tx.stockMovement.create({
      data: {
        productId: productId!,
        quantity,
        movementType: movementType!,
        reason: reason!.trim(),
        createdById: userId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
            currentStock: true,
            minimumStock: true
          }
        },
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
      data: movement
    };
  });
};

/**
 * Fetches paginated and filterable Stock Movements audit log.
 */
export const getStockMovementsService = async (
  queryParams: GetStockMovementsQuery
): Promise<PaginatedMovementsResult> => {
  const page = Math.max(1, parseInt(String(queryParams.page || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(queryParams.limit || 10), 10)));
  const skip = (page - 1) * limit;

  const whereClause: Prisma.StockMovementWhereInput = {};

  if (queryParams.productId && queryParams.productId.trim() !== '') {
    whereClause.productId = queryParams.productId.trim();
  }

  if (queryParams.movementType && Object.values(MovementType).includes(queryParams.movementType)) {
    whereClause.movementType = queryParams.movementType;
  }

  if (queryParams.fromDate || queryParams.toDate) {
    whereClause.createdAt = {};
    if (queryParams.fromDate) {
      whereClause.createdAt.gte = new Date(queryParams.fromDate);
    }
    if (queryParams.toDate) {
      // Set to end of the day
      const endDate = new Date(queryParams.toDate);
      endDate.setHours(23, 59, 59, 999);
      whereClause.createdAt.lte = endDate;
    }
  }

  const [total, movements] = await Promise.all([
    prisma.stockMovement.count({ where: whereClause }),
    prisma.stockMovement.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
            currentStock: true,
            minimumStock: true
          }
        },
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
    data: movements,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

/**
 * Retrieves a single Stock Movement audit record by unique ID.
 */
export const getStockMovementByIdService = async (id: string): Promise<StockMovement | null> => {
  return await prisma.stockMovement.findUnique({
    where: { id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          category: true,
          currentStock: true,
          minimumStock: true
        }
      },
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
