import { PrismaClient, Role } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AuthUserPayload } from '../types/express';
import { RegisterInput } from '../validators/authValidator';

const prisma = new PrismaClient();

export interface AuthResult {
  token: string;
  user: AuthUserPayload;
}

export interface RegisterResult {
  success: boolean;
  message?: string;
  data?: AuthResult;
}

/**
 * Registers a new user account with hashed password and generates session JWT.
 */
export const registerUser = async (input: RegisterInput): Promise<RegisterResult> => {
  const { name, email, password, role } = input;
  const normalizedEmail = email!.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    return {
      success: false,
      message: 'User with this email address already exists.'
    };
  }

  const hashedPassword = await hashPassword(password!);

  const newUser = await prisma.user.create({
    data: {
      name: name!.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || Role.SALES
    }
  });

  const userPayload: AuthUserPayload = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role
  };

  const token = generateToken(userPayload);

  return {
    success: true,
    data: {
      token,
      user: userPayload
    }
  };
};

/**
 * Authenticates user credentials and produces a JWT session token.
 */
export const loginUser = async (emailInput: string, passwordInput: string): Promise<AuthResult | null> => {
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
