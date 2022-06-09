const { StatusCodes } = require('http-status-codes');
const { prisma } = require('../../../db');
const dayjs = require('dayjs');

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

async function updateInvoice(req, res, id) {
    // Update invoices
    try {
        const reqBody = req.body;
        const parsedInstallments = parseInt(reqBody.installments);
        const parsedPrice = parseFloat(reqBody.price);
        // purchaseDate should be in YYYY-MM-DD format
        const isPurchaseDateValid = String(reqBody.purchaseDate).match(/^\d{4}-\d{2}-\d{2}$/);
        if (!isPurchaseDateValid) {
            throw new Error('Incorrect purchaseDate');
        }
        if (!Number.isInteger(parsedInstallments)) {
            throw new Error('Incorrect installments');
        }
        if (parsedPrice === NaN || parsedPrice === Infinity) {
            throw new Error('Incorrect price');
        }
        // Convert YYYY-MM-DD format to dayjs object
        const purchaseDate = dayjs(reqBody.purchaseDate);
        // If there are installments, endDate will be 
        // purchaseDate + installments (-1) in months
        // If the invoice is recurring, endDate
        // will only be filled when it's not recurring
        // anymore
        // Otherwise, endDate === purchaseDate
        let endDate = purchaseDate.clone();
        if (parsedInstallments > 0) {
            // The added months will be
            // parsedInstallments - 1, because
            // the first installment is already on
            // the first month
            endDate = endDate.add(parsedInstallments - 1, 'month');
        }
        // Transform endDate into Date object
        // Since it will or won't become undefined
        endDate = endDate.toDate()
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
                endDate,
                billingType: {
                    connect: { id: reqBody.billingTypeId }
                },
                category: {
                    connect: { id: reqBody.categoryId }
                },
                installments: reqBody.installments,
                recurring: reqBody.recurring,
                price: parsedPrice
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