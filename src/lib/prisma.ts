// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // In production we instantiate a single Prisma client.
  prisma = new PrismaClient();
} else {
  // In development we use a global to avoid hot‑module reload issues.
  // @ts-ignore – global augmentation
  if (!global.__prisma) {
    // @ts-ignore
    global.__prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.__prisma;
}

export default prisma;
