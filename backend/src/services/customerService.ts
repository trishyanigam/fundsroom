import { PrismaClient, Customer, CustomerStatus, CustomerType, Prisma } from '@prisma/client';
import { CreateCustomerInput, UpdateCustomerInput } from '../validators/customerValidator';

const prisma = new PrismaClient();

export interface GetCustomersQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  status?: CustomerStatus;
  customerType?: CustomerType;
}

export interface PaginatedCustomersResult {
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Creates a new Customer record in the database.
 */
export const createCustomerService = async (
  input: CreateCustomerInput,
  userId: string
): Promise<Customer> => {
  const followUpDateObj = input.followUpDate ? new Date(input.followUpDate) : null;

  return await prisma.customer.create({
    data: {
      customerName: input.customerName!.trim(),
      mobile: input.mobile!.trim(),
      email: input.email!.trim().toLowerCase(),
      businessName: input.businessName!.trim(),
      gstNumber: input.gstNumber ? input.gstNumber.trim() : null,
      customerType: input.customerType!,
      address: input.address!.trim(),
      status: input.status!,
      followUpDate: followUpDateObj,
      notes: input.notes ? input.notes.trim() : null,
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
};

/**
 * Fetches paginated, searchable, and filterable list of customers.
 */
export const getCustomersService = async (
  queryParams: GetCustomersQuery
): Promise<PaginatedCustomersResult> => {
  const page = Math.max(1, parseInt(String(queryParams.page || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(queryParams.limit || 10), 10)));
  const skip = (page - 1) * limit;

  const whereClause: Prisma.CustomerWhereInput = {};

  // Filters
  if (queryParams.status && Object.values(CustomerStatus).includes(queryParams.status)) {
    whereClause.status = queryParams.status;
  }

  if (queryParams.customerType && Object.values(CustomerType).includes(queryParams.customerType)) {
    whereClause.customerType = queryParams.customerType;
  }

  // Multi-field search
  if (queryParams.search && queryParams.search.trim() !== '') {
    const searchTerm = queryParams.search.trim();
    whereClause.OR = [
      { customerName: { contains: searchTerm, mode: 'insensitive' } },
      { businessName: { contains: searchTerm, mode: 'insensitive' } },
      { mobile: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where: whereClause }),
    prisma.customer.findMany({
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
    data: customers,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

/**
 * Retrieves a single customer record by unique ID.
 */
export const getCustomerByIdService = async (id: string): Promise<Customer | null> => {
  return await prisma.customer.findUnique({
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
 * Updates an existing customer record.
 */
export const updateCustomerService = async (
  id: string,
  input: UpdateCustomerInput
): Promise<Customer | null> => {
  const existingCustomer = await prisma.customer.findUnique({ where: { id } });
  if (!existingCustomer) {
    return null;
  }

  const updateData: Prisma.CustomerUpdateInput = {};

  if (input.customerName !== undefined) updateData.customerName = input.customerName.trim();
  if (input.mobile !== undefined) updateData.mobile = input.mobile.trim();
  if (input.email !== undefined) updateData.email = input.email.trim().toLowerCase();
  if (input.businessName !== undefined) updateData.businessName = input.businessName.trim();
  if (input.gstNumber !== undefined) updateData.gstNumber = input.gstNumber ? input.gstNumber.trim() : null;
  if (input.customerType !== undefined) updateData.customerType = input.customerType;
  if (input.address !== undefined) updateData.address = input.address.trim();
  if (input.status !== undefined) updateData.status = input.status;
  if (input.notes !== undefined) updateData.notes = input.notes ? input.notes.trim() : null;
  if (input.followUpDate !== undefined) {
    updateData.followUpDate = input.followUpDate ? new Date(input.followUpDate) : null;
  }

  return await prisma.customer.update({
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
};
