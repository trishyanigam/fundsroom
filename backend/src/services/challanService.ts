import { PrismaClient, Challan, ChallanStatus, Prisma } from '@prisma/client';
import { CreateChallanInput, UpdateChallanInput } from '../validators/challanValidator';

const prisma = new PrismaClient();

export interface GetChallansQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  status?: ChallanStatus;
  customerId?: string;
}

export interface PaginatedChallansResult {
  data: Challan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ChallanOperationResult {
  success: boolean;
  isCustomerNotFound?: boolean;
  isProductNotFound?: boolean;
  isNotFound?: boolean;
  isStatusConflict?: boolean;
  message?: string;
  data?: Challan;
}

/**
 * Generates a unique, readable Challan Number (e.g. CH-2026-000001).
 */
const generateChallanNumber = async (tx: Prisma.TransactionClient): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await tx.challan.count();
  const sequence = String(count + 1).padStart(6, '0');
  const candidateNumber = `CH-${year}-${sequence}`;

  // Verify candidate is unique (handle race conditions)
  const existing = await tx.challan.findUnique({ where: { challanNumber: candidateNumber } });
  if (existing) {
    const timestampSeq = String(Date.now()).slice(-6);
    return `CH-${year}-${timestampSeq}`;
  }

  return candidateNumber;
};

/**
 * Creates a new Sales Challan in DRAFT status with historical product snapshots.
 */
export const createChallanService = async (
  input: CreateChallanInput,
  userId: string
): Promise<ChallanOperationResult> => {
  const { customerId, items } = input;

  return await prisma.$transaction(async (tx) => {
    // 1. Verify Customer exists
    const customer = await tx.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return {
        success: false,
        isCustomerNotFound: true,
        message: 'Customer not found.'
      };
    }

    // 2. Fetch and snapshot Product metadata for each item
    let calculatedTotalQty = 0;
    const itemSnapshots: {
      productId: string;
      productName: string;
      sku: string;
      unitPrice: Prisma.Decimal;
      quantity: number;
    }[] = [];

    for (const item of items!) {
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return {
          success: false,
          isProductNotFound: true,
          message: `Product with ID '${item.productId}' was not found.`
        };
      }

      const qty = parseInt(String(item.quantity), 10);
      calculatedTotalQty += qty;

      itemSnapshots.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.unitPrice,
        quantity: qty
      });
    }

    // 3. Generate unique Challan Number
    const challanNumber = await generateChallanNumber(tx);

    // 4. Create Challan and nested ChallanItem records (DRAFT status, zero stock mutation)
    const newChallan = await tx.challan.create({
      data: {
        challanNumber,
        customerId: customer.id,
        status: ChallanStatus.DRAFT,
        totalQuantity: calculatedTotalQty,
        createdById: userId,
        items: {
          create: itemSnapshots.map((snap) => ({
            productId: snap.productId,
            productName: snap.productName,
            sku: snap.sku,
            unitPrice: snap.unitPrice,
            quantity: snap.quantity
          }))
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
            businessName: true,
            email: true,
            mobile: true
          }
        },
        items: true,
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
      data: newChallan
    };
  });
};

/**
 * Fetches paginated, searchable, filterable Sales Challans list.
 */
export const getChallansService = async (
  queryParams: GetChallansQuery
): Promise<PaginatedChallansResult> => {
  const page = Math.max(1, parseInt(String(queryParams.page || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(queryParams.limit || 10), 10)));
  const skip = (page - 1) * limit;

  const whereClause: Prisma.ChallanWhereInput = {};

  if (queryParams.status && Object.values(ChallanStatus).includes(queryParams.status)) {
    whereClause.status = queryParams.status;
  }

  if (queryParams.customerId && queryParams.customerId.trim() !== '') {
    whereClause.customerId = queryParams.customerId.trim();
  }

  if (queryParams.search && queryParams.search.trim() !== '') {
    const searchTerm = queryParams.search.trim();
    whereClause.OR = [
      { challanNumber: { contains: searchTerm, mode: 'insensitive' } },
      { customer: { customerName: { contains: searchTerm, mode: 'insensitive' } } },
      { customer: { businessName: { contains: searchTerm, mode: 'insensitive' } } }
    ];
  }

  const [total, challans] = await Promise.all([
    prisma.challan.count({ where: whereClause }),
    prisma.challan.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
            businessName: true,
            email: true,
            mobile: true
          }
        },
        items: true,
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
    data: challans,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

/**
 * Retrieves a single Sales Challan by ID with full item snapshots.
 */
export const getChallanByIdService = async (id: string): Promise<Challan | null> => {
  return await prisma.challan.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          customerName: true,
          businessName: true,
          email: true,
          mobile: true,
          address: true,
          gstNumber: true
        }
      },
      items: true,
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
 * Updates an existing DRAFT Sales Challan (refreshes product snapshots & totalQuantity).
 */
export const updateChallanService = async (
  id: string,
  input: UpdateChallanInput
): Promise<ChallanOperationResult> => {
  return await prisma.$transaction(async (tx) => {
    const existingChallan = await tx.challan.findUnique({ where: { id } });

    if (!existingChallan) {
      return { success: false, isNotFound: true, message: 'Challan not found.' };
    }

    if (existingChallan.status !== ChallanStatus.DRAFT) {
      return {
        success: false,
        isStatusConflict: true,
        message: `Challan cannot be edited because it is already ${existingChallan.status}.`
      };
    }

    let targetCustomerId = existingChallan.customerId;

    if (input.customerId && input.customerId !== existingChallan.customerId) {
      const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
      if (!customer) {
        return { success: false, isCustomerNotFound: true, message: 'Customer not found.' };
      }
      targetCustomerId = customer.id;
    }

    let updatedTotalQty = existingChallan.totalQuantity;

    if (input.items && input.items.length > 0) {
      // Re-read products and build new item snapshots
      let calculatedTotal = 0;
      const itemSnapshots: {
        productId: string;
        productName: string;
        sku: string;
        unitPrice: Prisma.Decimal;
        quantity: number;
      }[] = [];

      for (const item of input.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          return {
            success: false,
            isProductNotFound: true,
            message: `Product with ID '${item.productId}' was not found.`
          };
        }

        const qty = parseInt(String(item.quantity), 10);
        calculatedTotal += qty;

        itemSnapshots.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.unitPrice,
          quantity: qty
        });
      }

      updatedTotalQty = calculatedTotal;

      // Delete existing line items and replace with new snapshots
      await tx.challanItem.deleteMany({ where: { challanId: id } });
      await tx.challanItem.createMany({
        data: itemSnapshots.map((snap) => ({
          challanId: id,
          productId: snap.productId,
          productName: snap.productName,
          sku: snap.sku,
          unitPrice: snap.unitPrice,
          quantity: snap.quantity
        }))
      });
    }

    const updatedChallan = await tx.challan.update({
      where: { id },
      data: {
        customerId: targetCustomerId,
        totalQuantity: updatedTotalQty
      },
      include: {
        customer: true,
        items: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    return {
      success: true,
      data: updatedChallan
    };
  });
};

/**
 * Cancels a DRAFT Sales Challan (DRAFT -> CANCELLED). Zero stock mutation.
 */
export const cancelChallanService = async (id: string): Promise<ChallanOperationResult> => {
  const existingChallan = await prisma.challan.findUnique({ where: { id } });

  if (!existingChallan) {
    return { success: false, isNotFound: true, message: 'Challan not found.' };
  }

  if (existingChallan.status !== ChallanStatus.DRAFT) {
    return {
      success: false,
      isStatusConflict: true,
      message: `Challan cannot be cancelled because it is already ${existingChallan.status}.`
    };
  }

  const cancelledChallan = await prisma.challan.update({
    where: { id },
    data: { status: ChallanStatus.CANCELLED },
    include: {
      customer: true,
      items: true,
      createdBy: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });

  return {
    success: true,
    data: cancelledChallan
  };
};

export interface ConfirmationInsufficientStockData {
  productId: string;
  productName: string;
  availableStock: number;
  requestedQuantity: number;
}

export interface ConfirmChallanResult extends ChallanOperationResult {
  isInsufficientStock?: boolean;
  stockErrorData?: ConfirmationInsufficientStockData;
}

/**
 * Confirms a DRAFT Sales Challan inside an interactive Prisma Transaction:
 * 1. Verifies DRAFT status.
 * 2. Checks current stock for ALL line items.
 * 3. Rollbacks cleanly if ANY product has insufficient stock.
 * 4. Deducts Product.currentStock, creates OUT StockMovement records, and marks status CONFIRMED.
 */
export const confirmChallanService = async (
  id: string,
  userId: string
): Promise<ConfirmChallanResult> => {
  return await prisma.$transaction(async (tx) => {
    // 1. Load Challan with line items
    const challan = await tx.challan.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!challan) {
      return { success: false, isNotFound: true, message: 'Challan not found.' };
    }

    // 2. Validate Status
    if (challan.status === ChallanStatus.CONFIRMED) {
      return {
        success: false,
        isStatusConflict: true,
        message: 'Challan is already confirmed'
      };
    }

    if (challan.status === ChallanStatus.CANCELLED) {
      return {
        success: false,
        isStatusConflict: true,
        message: 'Cancelled challan cannot be confirmed'
      };
    }

    if (challan.status !== ChallanStatus.DRAFT) {
      return {
        success: false,
        isStatusConflict: true,
        message: `Challan in status ${challan.status} cannot be confirmed.`
      };
    }

    // 3. Pre-check stock for EVERY line item before modifying anything
    for (const item of challan.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return {
          success: false,
          isProductNotFound: true,
          message: `Product '${item.productName}' no longer exists in catalog.`
        };
      }

      if (product.currentStock < item.quantity) {
        // ROLLBACK TRANSACTION IMMEDIATELY
        return {
          success: false,
          isInsufficientStock: true,
          message: `Insufficient stock for product ${product.name}`,
          stockErrorData: {
            productId: product.id,
            productName: product.name,
            availableStock: product.currentStock,
            requestedQuantity: item.quantity
          }
        };
      }
    }

    // 4. All products have sufficient stock -> Deduct stock and log OUT movements
    for (const item of challan.items) {
      const updateResult = await tx.product.updateMany({
        where: {
          id: item.productId,
          currentStock: { gte: item.quantity }
        },
        data: {
          currentStock: { decrement: item.quantity }
        }
      });

      if (updateResult.count === 0) {
        throw new Error(`Concurrency stock conflict on product ID '${item.productId}'. Stock was modified right before confirmation.`);
      }

      // Create OUT StockMovement
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          movementType: 'OUT',
          reason: `Sales Challan ${challan.challanNumber}`,
          createdById: userId
        }
      });
    }

    // 5. Update Challan status to CONFIRMED
    const confirmedChallan = await tx.challan.update({
      where: { id },
      data: { status: ChallanStatus.CONFIRMED },
      include: {
        customer: true,
        items: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    return {
      success: true,
      data: confirmedChallan
    };
  });
};

