const { v4: uuidv4 } = require('uuid');
const knex = require('./../configs/knex');
const db = require('./../configs/knex');

const TABLE = 'DownloadLinks';

async function getAllByUserId(Customer) {
    return await db(TABLE).where({ Customer });
}

async function registerOrder(Customer, ItemID, OrderID, ItemTitle, ItemNumber, CreditsUsed = 0, MemberLevel) {

    try {
        await db(TABLE).insert({
            LinkGuid: uuidv4(),
            Customer,
            ItemID,
            OrderID,
            ItemTitle,
            ItemNumber,
            OrderDate: knex.fn.now(),
            CreditsUsed,
            MemberLevel
        });
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllByUserId,
    registerOrder
}