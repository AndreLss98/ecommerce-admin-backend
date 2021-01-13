const db = require('./../configs/knex');

const TABLE = 'CreditUsageLog';

async function getAllByCustomerID(CustomerID) {
    return await db(TABLE).where({ CustomerID }).orderBy('UsageDate', 'desc');
}

async function getAllInInteval(startDate, endDate, itemID) {
    let query = endDate && startDate !== endDate? db(TABLE).whereBetween('UsageDate', [startDate, endDate]) :
        db(TABLE).where('UsageDate', '>=', startDate);

    if (itemID) query.andWhere({ itemID });
    return await query.orderBy('UsageDate', 'desc');
}

module.exports = {
    getAllByCustomerID,
    getAllInInteval
}