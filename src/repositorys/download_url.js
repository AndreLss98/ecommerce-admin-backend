const db = require('./../configs/knex');

const TABLE = 'DownloadLinks';

async function getAllByUserId(Customer) {
    return await db(TABLE).where({ Customer });
}

module.exports = {
    getAllByUserId
}