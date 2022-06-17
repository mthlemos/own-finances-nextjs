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
        const { fromDate, toDate, categoryId, billingTypeId } = req.query;
        if (!fromDate && toDate) {
            throw new Error('Missing fromDate param!')
        }
        const queryObject = {
            AND: [],
            OR: []
        };
        if (fromDate) {
            // fromDate should be in YYYY-MM format
            const isFromDateValid = String(fromDate).match(/^\d{4}-\d{2}$/);
            if (!isFromDateValid) {
                throw new Error('Incorrect fromDate');
            }
            // Convert YYYY-MM date format to dayjs object
            const parsedFromDate = dayjs(fromDate);
            // Set query params
            queryObject.OR.push({
                purchaseDate: {
                    gte: parsedFromDate.toDate()
                }
            });
            // In order to show the invoices in which the
            // installments are in the selected date range
            // endDate should be less than equal the fromDate
            queryObject.OR.push({
                endDate: {
                    gte: parsedFromDate.toDate()
                }
            });
            // If no toDate was provided, limit search to the
            // end of the month of the fromDate
            if (!toDate) {
                queryObject.AND.push({
                    purchaseDate: {
                        lte: parsedFromDate.endOf('month').toDate()
                    }
                });
            }
        }
        if (toDate) {
            // toDate should be in YYYY-MM format
            const isToDateValid = String(toDate).match(/^\d{4}-\d{2}$/);
            if (!isToDateValid) {
                throw new Error('Incorrect to date');
            }
            // Convert YYYY-MM date format to dayjs object
            const parsedToDate = dayjs(toDate);
            // Set query to end of month
            queryObject.AND.push({
                purchaseDate: {
                    lte: parsedToDate.endOf('month').toDate()
                }
            });
        }
        if (billingTypeId) {
            if (typeof billingTypeId !== 'string') {
                throw new Error('Incorrect billing type id');
            }
            queryObject.AND.push({
                billingType: {
                    id: billingTypeId
                }
            });
        }
        if (categoryId) {
            if (typeof categoryId !== 'string') {
                throw new Error('Incorrect category type id');
            }
            queryObject.AND.push({
                category: {
                    id: categoryId
                }
            });
        }
        // If fromDate or toDate was added,
        // recurring invoices should also
        // be returned
        if (fromDate) {
            queryObject.OR.push({
                recurring: true
            });
        } else {
            // Else, only the ones with category and/or billing type
            Object.assign(queryObject, queryParams);
        }
        const invoices = await prisma.invoice.findMany({
            where: queryObject,
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