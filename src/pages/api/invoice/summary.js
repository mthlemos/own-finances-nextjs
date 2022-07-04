const { StatusCodes } = require('http-status-codes');
const { prisma } = require('../../../db');
const dayjs = require('dayjs');

export default async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            return getInvoiceSummary(req, res);
        default:
            res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
                message: 'Invalid Method!'
            });
    }
}

async function getInvoiceSummary(req, res) {
    const { fromDate, type } = req.query;
    if (!fromDate) {
        throw new Error("Missing fromDate parameter");
    }
    // fromDate should be in YYYY-MM format
    const isFromDateValid = String(fromDate).match(/^\d{4}-\d{2}$/);
    if (!isFromDateValid) {
        throw new Error('Incorrect fromDate');
    }
    // Convert YYYY-MM date format to dayjs object
    const parsedFromDate = dayjs(fromDate);

    // Check if the 'type' param is within the expected
    const isTypeValid = ['category', 'billingType'].includes(type);

    if (!isTypeValid) {
        throw new Error('Incorrect type');
    }

    const parsedType = type === 'category' ? 'categoryId' : 'billingTypeId'

    const queryParams = {
        OR: [],
        AND: []
    };

    // In order for invoices of the current month to show
    // purchaseDate should be
    // >= start of the month
    // <= end of the month
    queryParams.OR.push({
        purchaseDate: {
            gte: parsedFromDate.toDate()
        }
    });
    queryParams.AND.push({
        purchaseDate: {
            lte: parsedFromDate.endOf('month').toDate()
        }
    });

    // In order to show the invoices with installments
    // that are in the current month
    // endDate >= start of the month
    queryParams.OR.push({
        endDate: {
            gte: parsedFromDate.toDate()
        }
    });

    // Also include recurring invoices
    queryParams.OR.push({
        recurring: true
    })

    // Get either categories or billingTypes
    const typeNames = await prisma[type].findMany();
    // Convert array to object
    const namesObject = typeNames.reduce((acc, currType) => {
        acc[currType.id] = currType.name;
        return acc;
    }, {});

    // Get grouped results
    const invoiceGroupBy = await prisma.invoice.groupBy({
        by: [parsedType],
        _sum: {
            price: true
        },
        orderBy: {
            _sum: {
                price: 'desc'
            }
        },
        where: queryParams
    });

    // Organize groupBy query results
    // into category name with price sum
    const result = invoiceGroupBy.reduce((acc, currGroup) => {
        // currGroup consists of
        // {
        //     _sum: {
        //         price: 0
        //     },
        //     categoryId: "id"
        // }
        // Get name from id
        // parsedType is the id field foreign key
        // Eg.: type is 'category' and parsedType is 'categoryId'
        const typeName = namesObject[currGroup[parsedType]];
        const price = currGroup._sum.price;
        acc.push({
            name: typeName,
            price
        });

        return acc;
    }, []);

    res.status(StatusCodes.OK).json({
        message: 'Success',
        data: result
    });
}