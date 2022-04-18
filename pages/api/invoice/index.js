const { StatusCodes } = require('http-status-codes');
const { PrismaClient } = require('@prisma/client');
const dayjs = require('dayjs');

// Instantiate a single prisma client for all the routes
const prisma = new PrismaClient();

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
        const invoices = await prisma.invoice.findMany();
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
            let parsedStartDate = parseInt(startDate);
            if (!Number.isInteger(parsedStartDate)) {
                throw new Error('Incorrect start date');
            }
            // Clean start date making sure it's only
            // date, without hour, minute and seconds
            parsedStartDate = dayjs(parsedStartDate);
            parsedStartDate.hour(0);
            parsedStartDate.minute(0);
            parsedStartDate.second(0);
            // Set query params
            queryParams.purchaseDate = {
                gte: parsedStartDate.toDate()
            };
        }
        if (endDate) {
            let parsedEndDate = parseInt(endDate);
            if (!Number.isInteger(parsedEndDate)) {
                throw new Error('Incorrect end date');
            }
            // Clean end date making sure it's only
            // date, without hour, minute and seconds
            parsedEndDate = dayjs(parsedEndDate);
            parsedEndDate.hour(0);
            parsedEndDate.minute(0);
            parsedEndDate.second(0);
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