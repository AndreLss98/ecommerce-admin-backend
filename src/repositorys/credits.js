const db = require('./../configs/knex');

const TABLE = 'CreditUsageLog';

async function getAllByCustomerID(CustomerID) {
    return await db(TABLE).where({ CustomerID, CreditsUsed: 1 }).orderBy('UsageDate', 'desc');
}

async function getAllInInteval(startDate, endDate) {
    let query = endDate && startDate !== endDate? db(TABLE).andWhere({ CreditsUsed: 1 }).whereBetween('UsageDate', [startDate, endDate]) :
        db(TABLE).where('UsageDate', '>=', startDate).andWhere({ CreditsUsed: 1 });
    return await query.orderBy('UsageDate', 'desc');
}

module.exports = {
    getAllByCustomerID,
    getAllInInteval
}