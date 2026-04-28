import { PrismaClient } from '@prisma/client'

// 避免开发环境热重载时创建多个实例
const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
