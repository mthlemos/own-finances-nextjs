const { StatusCodes } = require('http-status-codes');
const { PrismaClient } = require('@prisma/client');
const dayjs = require('dayjs');

// Instantiate a single prisma client for all the routes
const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { id } = req.query;
    switch (req.method) {
        case 'GET':
            return getInvoice(req, res, id);
        case 'PUT':
            return updateInvoice(req, res, id);
        case 'DELETE':
            return deleteInvoice(req, res, id);
        default:
            res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
                message: 'Invalid Method!'
            });
    }
}

async function getInvoice(req, res, id) {
    // Get specific invoice
    try {
        const invoice = await prisma.invoice.findUnique({
            where: {
                id
            }
        });
        req.res(StatusCodes.OK).json({
            message: 'Success',
            data: invoice
        });
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }

}

async function updateInvoice(req, res, id) {
    // Update invoices
    try {
        const reqBody = req.body;
        const parsedPurchaseDate = parseInt(reqBody.purchaseDate);
        const parsedInstallments = parseInt(reqBody.installments);
        if (!Number.isInteger(parsedPurchaseDate)) {
            throw new Error('Incorrect date');
        }
        if (!Number.isInteger(parsedInstallments)) {
            throw new Error('Incorrect installments');
        }
        // Set Hour, Minute and Seconds to 0
        // To make sure we're only getting the date
        const purchaseDate = dayjs(parsedPurchaseDate);
        purchaseDate.hour(0);
        purchaseDate.minute(0);
        purchaseDate.second(0);
        // If there are installments, endDate will be 
        // purchaseDate + installments in months
        // If the invoice is recurring, endDate
        // will only be filled when it's not recurring
        // anymore
        // Otherwise, endDate === purchaseDate
        let endDate = purchaseDate.clone();
        if (parsedInstallments > 0) {
            endDate = endDate.add(parsedInstallments, 'month');
            endDate = endDate.toDate();
        }
        if (reqBody.recurring) {
            endDate = undefined;
        }
        const invoice = await prisma.invoice.update({
            where: {
                id
            },
            data: {
                name: reqBody.name,
                purchaseDate: purchaseDate.toDate(),
                endDate: endDate.toDate(),
                billingType: {
                    connect: { id: reqBody.billingTypeId }
                },
                category: {
                    connect: { id: reqBody.categoryId }
                },
                installments: reqBody.installments,
                recurring: reqBody.recurring
            }
        })
        res.status(StatusCodes.OK).json({
            message: 'Success',
            data: invoice
        });
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
}

async function deleteInvoice(req, res, id) {
    try {
        await prisma.invoice.delete({
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