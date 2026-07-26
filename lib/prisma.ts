import { PrismaClient } from '@prisma/client';

declare global {
  // Allows global `prisma` variable to be shared across hot reloads in development
  // This prevents multiple instances of PrismaClient which can cause connection issues.
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
