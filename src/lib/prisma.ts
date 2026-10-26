import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const prismaClientSingleton = () => {
  // 1. Secure the database connection string from environment variables
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('CRITICAL: DATABASE_URL environment variable is missing.');
  }

  // 2. Configure the connection pool (max 10 active database queries, 30s timeout)
  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
  });

  // 3. Initialize the Prisma Postgres adapter with the configured pool
  const adapter = new PrismaPg(pool);

  // 4. Create and return the Prisma Client instance
  return new PrismaClient({ adapter });
};

// 5. Augment the global scope to preserve the instance during Next.js HMR
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

// 6. Instantiate the Prisma client using the singleton pattern
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

// 7. Persist the instance globally only in development environments
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}