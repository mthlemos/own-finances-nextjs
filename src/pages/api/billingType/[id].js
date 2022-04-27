const { StatusCodes } = require('http-status-codes');
const { PrismaClient } = require('@prisma/client');

// Instantiate a single prisma client for all the routes
const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { id } = req.query;
    switch (req.method) {
        case 'GET':
            return getBillingType(req, res, id)
        case 'PUT':
            return updateBillingType(req, res, id);
        case 'DELETE':
            return deleteBillingType(req, res, id);
        default:
            res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
                message: 'Invalid Method!'
            });
    }
}

async function getBillingType(req, res, id) {
    // Get specific billing type
    try {
        const billingType = await prisma.billingType.findUnique({
            where: {
                id
            }
        });
        req.res(StatusCodes.OK).json({
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

async function updateBillingType(req, res, id) {
    // Update billing type
    try {
        const reqBody = req.body;
        const billingType = await prisma.billingType.update({
            where: {
                id
            },
            data: {
                name: reqBody.name,
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

async function deleteBillingType(req, res, id) {
    try {
        await prisma.billingType.delete({
            where: {
                id
            }
        });
        res.status(StatusCodes.OK).json({
            message: 'Deleted'
        });
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
}