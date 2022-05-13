const dayjs = require('dayjs');

// Prisma middleware to format invoice's purchaseDate and endDate
// to YYYY-MM-DD string format
const purchaseDateMiddleware = async (params, next) => {
    if (params.model === 'Invoice' && params.action.startsWith('find')) {
        // Since it's an Invoice, we need to get the query result
        // In order to modify the purchaseDate and endDate fields
        const result = await next(params);
        // If is array, change fields for every entry
        if (Array.isArray(result)) {
            result.forEach(entry => {
                entry.purchaseDate = dayjs(entry.purchaseDate).format('YYYY-MM-DD');
                entry.endDate = dayjs(entry.endDate).format('YYYY-MM-DD');
            });
        } else {
            // Else, change for the single entry
            result.purchaseDate = dayjs(result.purchaseDate).format('YYYY-MM-DD');
            result.endDate = dayjs(result.endDate).format('YYYY-MM-DD');
        }
        // Return changed object
        return result;
    }
    // Is not a Invoice, continue to the next middleware
    return next(params);
}

module.exports = { purchaseDateMiddleware }