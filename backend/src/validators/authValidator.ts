export interface LoginInput {
  email?: string;
  password?: string;
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
