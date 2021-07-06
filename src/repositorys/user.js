const db = require('./../configs/knex');
const bcrypt = require('bcryptjs');
const { count } = require('./../configs/knex');


const TABLE = 'Customers';
const ADMIN_TABLE = 'AdminUser';
const TABLE_ACCESS = 'CustomerAccessLog';

async function getByEmail(CustomerEmail) {
    return await db.select([`${TABLE}.*`]).count(`${TABLE_ACCESS}.CustomerID`, {as: 'TotalAccessLog' }).from(TABLE).leftJoin(TABLE_ACCESS, `${TABLE_ACCESS}.CustomerID`, `${TABLE}.ShopifyCustomerNumber` ).where({ CustomerEmail }).groupBy(`${TABLE_ACCESS}.CustomerID`).first();
}

async function getCountAccess(CustomerID){
    try {
        let query = db(TABLE_ACCESS).count('*', {as: 'totalLog'}).first();
        return (await query.where({CustomerID})).totalLog;
    } catch(error){
        throw error;
    }
}

async function getAll(pageNumber, limitAll, args){
    let query = db.select([`${TABLE}.*`]).count(`${TABLE_ACCESS}.CustomerID`, {as: 'TotalAccessLog' }).from(TABLE).leftJoin(TABLE_ACCESS, `${TABLE}.ShopifyCustomerNumber`, `${TABLE_ACCESS}.CustomerID`).groupBy(`${TABLE}.ShopifyCustomerNumber`).offset((pageNumber * limitAll) - limitAll).limit(limitAll);
    if(args.startDate){
        return await query.whereBetween('LastAccess', [args.startDate, args.endDate]);
    } 
    else if(args.topUsers){
        return await db.select([`${TABLE}.*`]).count(`${TABLE_ACCESS}.CustomerID`, {as: 'TotalAccessLog' }).from(TABLE).leftJoin(TABLE_ACCESS, `${TABLE}.ShopifyCustomerNumber`, `${TABLE_ACCESS}.CustomerID`).groupBy(`${TABLE}.ShopifyCustomerNumber`).orderBy([{ column: 'TotalAccessLog', order: 'desc' }]).limit(args.topUsers);
    }else{
        return await query.limit(limitAll);
    }
    
}

async function getCount(args) {
    let query = db(TABLE).count('*', { as: 'totalItems' }).first();
    if(args.startDate){
        return (await query.whereBetween('LastAccess', [args.startDate, args.endDate])).totalItems
    }
    return (await query).totalItems
}

async function search(search_key) {
    return await db(TABLE).where(search_key).first();
}

async function getAdminUser(search_key) {
    return await db(ADMIN_TABLE).where(search_key).first();
}

async function saveAdminUser(user) {
    user.Hash = await bcrypt.hash(user.Senha, 10);
    delete user.Senha;

    try {
        const id = await db(ADMIN_TABLE).insert(user);
        return await db.select('Id', 'Nome').from(ADMIN_TABLE).where({ Id: id[0] }).first();
    } catch (error) {
        throw error;
    }
}

async function setCreditsOfUser(CustomerID, Credits) {
    try {
        return await db(TABLE).update({ Credits }).where({ CustomerID });
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAll,
    search,
    getCount,
    getByEmail,
    getAdminUser,
    saveAdminUser,
    setCreditsOfUser,
    getCountAccess
}