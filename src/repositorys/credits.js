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

async function alterPluginUsage(email, oldPlugin, newPlugin) {
    try {
        oldPlugin = parseInt(oldPlugin);

        const changeLink = await db.select(['DL.LinkID']).from('DownloadLinks AS DL')
            .innerJoin('Customers AS C', 'C.ShopifyCustomerNumber', 'DL.Customer')
            .where('C.CustomerEmail', '=', email).andWhere('DL.ItemID', '=', oldPlugin).orderBy('DL.LastAttempt', 'DESC').first();

        const changeLog = await db.select(['CUL.CreditUsageID']).from(`${TABLES_NAME.CREDITS_USAGE_LOG} AS CUL`)
            .innerJoin('Customers AS C', 'C.ShopifyCustomerNumber', 'CUL.CustomerID')
            .where('C.CustomerEmail', '=', email).andWhere('CUL.ItemID', '=', oldPlugin).orderBy('CUL.UsageDate', 'DESC').first();

        await db(TABLES_NAME.DOWNLOAD_LINKS).update({ ItemID: newPlugin.id, ItemTitle: newPlugin.title }).where({ LinkID: changeLink.LinkID });
        await db(TABLES_NAME.CREDITS_USAGE_LOG).update({ ItemID: newPlugin.id, ItemTitle: newPlugin.title }).where({ CreditUsageID: changeLog.CreditUsageID });
    } catch (error) {
        throw error;
    }
}

async function alterCreditUsageLog(CustomerID, oldPlugin, newPlugin) {
    return await db(TABLES_NAME.CREDITS_USAGE_LOG).update({ ItemID: newPlugin.id, ItemTitle: newPlugin.title }).where({ CustomerID, ItemID: oldPlugin });
}

module.exports = {
    getAllInInteval,
    alterPluginUsage,
    getAllByCustomerID,
    alterCreditUsageLog,
}