const { PrismaClient } = require('@prisma/client');
const { purchaseDateMiddleware } = require('./dbMiddlewares');

// Prisma Client should be a singleton, otherwise it'll create a ton of
// connection pools
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma
}

// Add prisma middlewares
prisma.$use(purchaseDateMiddleware);

module.exports = { prisma };