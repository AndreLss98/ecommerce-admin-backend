const db = require('./../configs/knex');

const TABLE = 'Customers';

async function getByEmail(CustomerEmail) {
    return await db(TABLE).where({ CustomerEmail }).first();
}

module.exports = {
    getByEmail
}