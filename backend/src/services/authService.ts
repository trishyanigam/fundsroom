import { PrismaClient } from '@prisma/client';
import { comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AuthUserPayload } from '../types/express';

const prisma = new PrismaClient();

export interface LoginResult {
  token: string;
  user: AuthUserPayload;
}

/**
 * Authenticates user credentials and produces a JWT session token.
 */
export const loginUser = async (emailInput: string, passwordInput: string): Promise<LoginResult | null> => {
  const normalizedEmail = emailInput.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!user) {
    return null;
  }

  const isPasswordValid = await comparePassword(passwordInput, user.password);

  if (!isPasswordValid) {
    return null;
  }

  const userPayload: AuthUserPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  const token = generateToken(userPayload);

  return {
    token,
    user: userPayload
  };
};

/**
 * Retrieves safe user profile information by User ID.
 */
export const getUserProfile = async (userId: string): Promise<AuthUserPayload | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });

  return user;
};
