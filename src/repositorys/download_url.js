const { v4: uuidv4 } = require('uuid');
const knex = require('./../configs/knex');
const db = require('./../configs/knex');

const TABLE = 'DownloadLinks';
const { TABLES_NAME } = require('./../shared/constantes');

async function getAllByUserId(Customer) {
    return await db(TABLES_NAME.DOWNLOAD_LINKS).where({ Customer });
}

async function registerOrder(Customer, ItemID, OrderID, ItemTitle, ItemNumber, CreditsUsed = 0) {

    try {
        await db(TABLES_NAME.DOWNLOAD_LINKS).insert({
            LinkGuid: uuidv4(),
            Customer,
            ItemID,
            OrderID,
            ItemTitle,
            ItemNumber,
            OrderDate: knex.fn.now(),
            CreditsUsed
        });
    } catch (error) {
        throw error;
    }
};

async function deleteByLinkID(LinkID) {
    LinkID = parseInt(LinkID);
    const link = await db(TABLES_NAME.DOWNLOAD_LINKS).where({ LinkID }).first();
    
    try {
        await db(TABLES_NAME.DOWNLOAD_LINKS).delete().where({ LinkID: link.LinkID });
        await db(TABLES_NAME.CREDITS_USAGE_LOG).delete().where({ CustomerID: link.Customer, ItemID: link.ItemID});
        return;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports = {
    registerOrder,
    deleteByLinkID,
    getAllByUserId,
}