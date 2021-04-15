const db = require('./../configs/knex');

const { TABLES_NAME } = require('./../shared/constantes');

async function getAllByCustomerID(CustomerID) {
    return await db(TABLES_NAME.CREDITS_USAGE_LOG).where({ CustomerID }).orderBy('UsageDate', 'desc');
}

async function getAllInInteval(startDate, endDate, itemID) {
    let query = endDate && startDate !== endDate? db(TABLES_NAME.CREDITS_USAGE_LOG).whereBetween('UsageDate', [startDate, endDate]) :
        db(TABLES_NAME.CREDITS_USAGE_LOG).where('UsageDate', '>=', startDate);

    if (itemID) query.andWhere({ itemID });
    return await query.orderBy('UsageDate', 'desc');
}

async function alterCreditUsageLog(CustomerID, oldPlugin, newPlugin) {
    return await db(TABLES_NAME.CREDITS_USAGE_LOG).update({ ItemID: newPlugin.id, ItemTitle: newPlugin.title }).where({ CustomerID, ItemID: oldPlugin });
}

module.exports = {
    getAllInInteval,
    getAllByCustomerID,
    alterCreditUsageLog,
}