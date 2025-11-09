import { PrismaClient } from "@prisma/client";

// This prevents Next.js hot-reloading from creating too many
// new PrismaClient instances in development.
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// We also re-export the generated types
export * from "@prisma/client";
