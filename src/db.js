const { PrismaClient } = require('@prisma/client');

// Prisma Client should be a singleton, otherwise it'll create a ton of
// connection pools
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma
}

module.exports = { prisma };