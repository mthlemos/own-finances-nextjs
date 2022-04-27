const { StatusCodes } = require('http-status-codes');
const { prisma } = require('../../../db');

export default async function handler(req, res) {
    const { id } = req.query;
    switch (req.method) {
        case 'GET':
            return getCategory(req, res, id)
        case 'PUT':
            return updateCategory(req, res, id);
        case 'DELETE':
            return deleteCategory(req, res, id);
        default:
            res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
                message: 'Invalid Method!'
            });
    }
}

async function getCategory(req, res, id) {
    // Get specific billing type
    try {
        const billingType = await prisma.category.findUnique({
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

async function updateCategory(req, res, id) {
    // Update category
    try {
        const reqBody = req.body;
        const billingType = await prisma.category.update({
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

async function deleteCategory(req, res, id) {
    try {
        await prisma.category.delete({
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