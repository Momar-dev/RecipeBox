import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const BCRYPT_ROUNDS = 12;

export interface AuthTokenPayload {
  userId: string;
  email: string;
  name: string | null;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

function generateToken(payload: AuthTokenPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET manquant dans les variables d\'environnement.');
  }
  const expiresIn = (process.env.JWT_EXPIRES_IN as string) || '7d';

  return jwt.sign(payload as object, secret, { expiresIn } as jwt.SignOptions);
}

function toUserResponse(user: {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}): AuthUserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}

export class AuthService {

  async register(data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<{ token: string; user: AuthUserResponse }> {

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      const err = new Error('Cette adresse e-mail est déjà associée à un compte.');
      (err as NodeJS.ErrnoException).code = 'EMAIL_TAKEN';
      throw err;
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name ?? null,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return { token, user: toUserResponse(user) };
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: AuthUserResponse }> {

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    const dummyHash = '$2b$12$invalidhashfortimingequalityXXXXXXXXXXXXXXXXXXXXXXXX';
    const passwordOk = await bcrypt.compare(
      data.password,
      user?.passwordHash ?? dummyHash
    );

    if (!user || !passwordOk) {
      const err = new Error('Identifiants incorrects.');
      (err as NodeJS.ErrnoException).code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return { token, user: toUserResponse(user) };
  }

  async getMe(userId: string): Promise<AuthUserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;
    return toUserResponse(user);
  }
}

export const authService = new AuthService();
