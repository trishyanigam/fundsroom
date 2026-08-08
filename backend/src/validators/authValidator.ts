import { Role } from '@prisma/client';

export interface LoginInput {
  email?: string;
  password?: string;
}

export interface RegisterInput {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates login request payload formatting.
 */
export const validateLoginInput = (input: LoginInput): ValidationResult => {
  const { email, password } = input;

  if (!email || typeof email !== 'string' || email.trim() === '') {
    return { isValid: false, message: 'Email address is required.' };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, message: 'Invalid email address format.' };
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    return { isValid: false, message: 'Password is required.' };
  }

  return { isValid: true };
};

/**
 * Validates user registration payload formatting.
 */
export const validateRegisterInput = (input: RegisterInput): ValidationResult => {
  const { name, email, password, role } = input;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return { isValid: false, message: 'User name is required.' };
  }

  if (!email || typeof email !== 'string' || email.trim() === '') {
    return { isValid: false, message: 'Email address is required.' };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, message: 'Invalid email address format.' };
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long.' };
  }

  if (role && !Object.values(Role).includes(role as Role)) {
    return { isValid: false, message: `Invalid role specified. Must be one of: ${Object.values(Role).join(', ')}` };
  }

  return { isValid: true };
};
