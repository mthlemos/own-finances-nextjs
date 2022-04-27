const { StatusCodes } = require('http-status-codes');
const { prisma } = require('../../../db');

export default async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            return getCategory(req, res);
        case 'POST':
            return createCategory(req, res);
        default:
            res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
                message: 'Invalid Method!'
            });
    }
}

async function getCategory(req, res) {
    // Get all category
    try {
        const categories = await prisma.category.findMany();
        res.status(StatusCodes.OK).json({
            message: 'Success',
            data: categories
        });
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err
        });
    }
}

async function createCategory(req, res) {
    // Create category
    try {
        const reqBody = req.body;
        const category = await prisma.category.create({
            data: {
                name: reqBody.name
            }
        })
        res.status(StatusCodes.OK).json({
            message: 'Success',
            data: category
        });
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
}