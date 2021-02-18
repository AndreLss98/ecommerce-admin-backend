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

async function alterPluginUsage(email, oldPlugin, newPlugin) {
    try {
        oldPlugin = parseInt(oldPlugin);

        const changeLink = await db.select(['DL.LinkID']).from('DownloadLinks AS DL')
            .innerJoin('Customers AS C', 'C.ShopifyCustomerNumber', 'DL.Customer')
            .where('C.CustomerEmail', '=', email).andWhere('DL.ItemID', '=', oldPlugin).orderBy('DL.LastAttempt', 'DESC').first();

        const changeLog = await db.select(['CUL.CreditUsageID']).from(`${TABLE} AS CUL`)
            .innerJoin('Customers AS C', 'C.ShopifyCustomerNumber', 'CUL.CustomerID')
            .where('C.CustomerEmail', '=', email).andWhere('CUL.ItemID', '=', oldPlugin).orderBy('CUL.UsageDate', 'DESC').first();

        await db('DownloadLinks').update({ ItemID: newPlugin.id, ItemTitle: newPlugin.title }).where({ LinkID: changeLink.LinkID });
        await db(TABLE).update({ ItemID: newPlugin.id, ItemTitle: newPlugin.title }).where({ CreditUsageID: changeLog.CreditUsageID });
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAllInInteval,
    alterPluginUsage,
    getAllByCustomerID,
}