import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password securely using bcrypt.
 * @param plaintext - The raw password string to hash.
 * @returns Hashed password string.
 */
export const hashPassword = async (plaintext: string): Promise<string> => {
  return await bcrypt.hash(plaintext, SALT_ROUNDS);
};

/**
 * Compares a plaintext password against a stored bcrypt hash.
 * @param plaintext - The raw password to verify.
 * @param hash - The stored bcrypt password hash.
 * @returns True if password matches, false otherwise.
 */
export const comparePassword = async (plaintext: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(plaintext, hash);
};
