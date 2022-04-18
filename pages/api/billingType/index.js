const { StatusCodes } = require('http-status-codes');
const { PrismaClient } = require('@prisma/client');

// Instantiate a single prisma client for all the routes
const prisma = new PrismaClient();

export default async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            return getBillingType(req, res);
        case 'POST':
            return createBillingType(req, res);
        default:
            res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
                message: 'Invalid Method!'
            });
    }
}

async function getBillingType(req, res) {
    // Get all billing types
    try {
        const billingTypes = await prisma.billingType.findMany();
        res.status(StatusCodes.OK).json({
            message: 'Success',
            data: billingTypes
        });
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err
        });
    }
}

async function createBillingType(req, res) {
    // Create billing type
    try {
        const reqBody = req.body;
        const billingType = await prisma.billingType.create({
            data: {
                name: reqBody.name
            }
        })
        res.status(StatusCodes.OK).json({
            message: 'Success',
            data: billingType
        });
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
}