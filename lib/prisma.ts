import { PrismaClient } from '@/app/generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL!
  
  const adapter = new PrismaNeon({ connectionString })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma