const { StatusCodes } = require('http-status-codes');
const { prisma } = require('../../../db');
const dayjs = require('dayjs');

export default async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            if (Object.keys(req.query).length > 0) {
                return getInvoiceWithQuery(req, res);
            } else {
                return getInvoice(req, res);
            }
        case 'POST':
            return createInvoice(req, res);
        default:
            res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
                message: 'Invalid Method!'
            });
    }
}

async function getInvoice(req, res) {
    // Get all invoices
    try {
        const invoices = await prisma.invoice.findMany({
            include: {
                category: true,
                billingType: true
            }
        });
        res.status(StatusCodes.OK).json({
            message: 'Success',
            data: invoices
        });
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err
        });
    }
}

async function getInvoiceWithQuery(req, res) {
    try {
        const { startDate, endDate, categoryId, billingTypeId } = req.query;
        if (!startDate && endDate) {
            throw new Error('Missing startDate param!')
        }
        const queryParams = {};
        if (startDate) {
            // startDate should be in YYYY-MM-DD format
            const isStartDateValid = String(startDate).match(/^\d{4}-\d{2}-\d{2}$/);
            if (!isStartDateValid) {
                throw new Error('Incorrect start date');
            }
            // Convert YYYY-MM-DD date format to dayjs object
            const parsedStartDate = dayjs(startDate);
            // Set query params
            queryParams.purchaseDate = {
                gte: parsedStartDate.toDate()
            };
        }
        if (endDate) {
            // endDate should be in YYYY-MM-DD format
            const isEndDateValid = String(endDate).match(/^\d{4}-\d{2}-\d{2}$/);
            if (!isEndDateValid) {
                throw new Error('Incorrect end date');
            }
            // // Convert YYYY-MM-DD date format to dayjs object
            const parsedEndDate = dayjs(endDate);
            // Set query params
            queryParams.endDate = {
                lte: parsedEndDate.toDate()
            };
        }
        if (billingTypeId) {
            if (typeof billingTypeId !== 'string') {
                throw new Error('Incorrect billing type id');
            }
            queryParams.billingType = {
                id: billingTypeId
            };
        }
        if (categoryId) {
            if (typeof categoryId !== 'string') {
                throw new Error('Incorrect category type id');
            }
            queryParams.category = {
                id: categoryId
            };
        }
        const queryObject = {};
        // If startDate was added,
        // recurring invoices should also
        // be returned
        if (startDate) {
            queryObject.OR = [
                queryParams,
                {
                    recurring: true
                }
            ];
        } else {
            // Else, only the ones with category and/or billing type
            Object.assign(queryObject, queryParams);
        }
        const invoices = await prisma.invoice.findMany({
            where: queryObject
        });
        res.status(StatusCodes.OK).json({
            message: 'Success',
            data: invoices
        });
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message
        });
    }
}

async function createInvoice(req, res) {
    // Create invoice invoices
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
        // purchaseDate + installments in months
        // If the invoice is recurring, endDate
        // will only be filled when it's not recurring
        // anymore
        // Otherwise, endDate === purchaseDate
        let endDate = purchaseDate.clone();
        if (parsedInstallments > 0) {
            endDate = endDate.add(parsedInstallments, 'month');
        }
        // Transform endDate into Date object
        // Since it will or won't become undefined
        endDate = endDate.toDate()
        if (reqBody.recurring) {
            endDate = undefined;
        }
        const invoice = await prisma.invoice.create({
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
                installments: parsedInstallments,
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