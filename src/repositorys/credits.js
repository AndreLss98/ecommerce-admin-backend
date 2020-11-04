const db = require('./../configs/knex');

const TABLE = 'CreditUsageLog';

async function getAllByCustomerID(CustomerID) {
    return await db(TABLE).where({ CustomerID }).orderBy('UsageDate', "desc");
}

module.exports = {
    getAllByCustomerID
}