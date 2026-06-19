import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg'; 

const prismaClientSingleton = () => {
  // 1. Securely grab the URL from your .env file
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("CRITICAL: DATABASE_URL is missing from .env");
  }

  // 2. Safely pass it to the Prisma adapter
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;