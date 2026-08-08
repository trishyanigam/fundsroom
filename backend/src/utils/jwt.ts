import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthUserPayload } from '../types/express';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined.');
  }
  return secret;
};

const getJwtExpiresIn = (): string => {
  return process.env.JWT_EXPIRES_IN || '24h';
};

/**
 * Signs a new JWT token containing safe user payload details.
 * @param payload User identity payload (id, name, email, role).
 * @returns Signed JWT string.
 */
export const generateToken = (payload: AuthUserPayload): string => {
  const options: SignOptions = {
    expiresIn: getJwtExpiresIn() as any
  };
  return jwt.sign(payload, getJwtSecret(), options);
};

/**
 * Verifies a JWT token signature and expiration.
 * @param token Raw Bearer JWT string.
 * @returns Decoded AuthUserPayload.
 */
export const verifyToken = (token: string): AuthUserPayload => {
  return jwt.verify(token, getJwtSecret()) as AuthUserPayload;
};
