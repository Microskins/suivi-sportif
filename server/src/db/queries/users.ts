// filepath: server/src/db/queries/users.ts
// User database queries - NEVER write SQL directly in routes

import prisma from "../index.js";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserResponse,
} from "../../schemas/index.js";
import bcrypt from "bcrypt";

const PASSWORD_SALT_ROUNDS = 10;

type UserRecord = Omit<UserResponse, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
};

export async function getUsers(): Promise<UserResponse[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return (users as UserRecord[]).map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }));
}

export async function getUserById(id: string): Promise<UserResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) return null;
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function getUserByEmail(
  email: string,
): Promise<(UserResponse & { password: string }) | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    password: user.password,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function createUser(data: CreateUserInput): Promise<UserResponse> {
  const hashedPassword = await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
  });
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function updateUser(
  id: string,
  data: UpdateUserInput,
): Promise<UserResponse | null> {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return null;

  const hashedPassword = data.password
    ? await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS)
    : undefined;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(data.email && { email: data.email }),
      ...(data.name && { name: data.name }),
      ...(hashedPassword && { password: hashedPassword }),
    },
  });
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await prisma.user.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<UserResponse | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) return null;

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
