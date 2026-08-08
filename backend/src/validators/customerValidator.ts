import { CustomerType, CustomerStatus } from '@prisma/client';

export interface CreateCustomerInput {
  customerName?: string;
  mobile?: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType?: CustomerType;
  address?: string;
  status?: CustomerStatus;
  followUpDate?: string;
  notes?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[+\d\s-]{7,15}$/;

/**
 * Validates payload data for creating a new Customer.
 */
export const validateCreateCustomer = (input: CreateCustomerInput): ValidationResult => {
  const { customerName, mobile, email, businessName, customerType, address, status, followUpDate } = input;

  if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
    return { isValid: false, message: 'Customer name is required and must be at least 2 characters long.' };
  }

  if (!mobile || typeof mobile !== 'string' || !MOBILE_REGEX.test(mobile.trim())) {
    return { isValid: false, message: 'A valid mobile number is required (7 to 15 digits).' };
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, message: 'A valid email address is required.' };
  }

  if (!businessName || typeof businessName !== 'string' || businessName.trim() === '') {
    return { isValid: false, message: 'Business name is required.' };
  }

  if (!customerType || !Object.values(CustomerType).includes(customerType)) {
    return { isValid: false, message: `Customer type must be one of: ${Object.values(CustomerType).join(', ')}` };
  }

  if (!status || !Object.values(CustomerStatus).includes(status)) {
    return { isValid: false, message: `Customer status must be one of: ${Object.values(CustomerStatus).join(', ')}` };
  }

  if (!address || typeof address !== 'string' || address.trim() === '') {
    return { isValid: false, message: 'Customer address is required.' };
  }

  if (followUpDate) {
    const dateParsed = Date.parse(followUpDate);
    if (isNaN(dateParsed)) {
      return { isValid: false, message: 'Invalid follow-up date format.' };
    }
  }

  return { isValid: true };
};

/**
 * Validates payload data for updating an existing Customer.
 */
export const validateUpdateCustomer = (input: UpdateCustomerInput): ValidationResult => {
  const { customerName, mobile, email, customerType, status, followUpDate } = input;

  if (customerName !== undefined) {
    if (typeof customerName !== 'string' || customerName.trim().length < 2) {
      return { isValid: false, message: 'Customer name must be at least 2 characters long.' };
    }
  }

  if (mobile !== undefined) {
    if (typeof mobile !== 'string' || !MOBILE_REGEX.test(mobile.trim())) {
      return { isValid: false, message: 'A valid mobile number is required (7 to 15 digits).' };
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return { isValid: false, message: 'A valid email address is required.' };
    }
  }

  if (customerType !== undefined) {
    if (!Object.values(CustomerType).includes(customerType)) {
      return { isValid: false, message: `Customer type must be one of: ${Object.values(CustomerType).join(', ')}` };
    }
  }

  if (status !== undefined) {
    if (!Object.values(CustomerStatus).includes(status)) {
      return { isValid: false, message: `Customer status must be one of: ${Object.values(CustomerStatus).join(', ')}` };
    }
  }

  if (followUpDate) {
    const dateParsed = Date.parse(followUpDate);
    if (isNaN(dateParsed)) {
      return { isValid: false, message: 'Invalid follow-up date format.' };
    }
  }

  return { isValid: true };
};
