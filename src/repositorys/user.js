const db = require('./../configs/knex');
const bcrypt = require('bcryptjs');


const TABLE = 'Customers';
const ADMIN_TABLE = 'AdminUser';

async function getByEmail(CustomerEmail) {
    return await db(TABLE).where({ CustomerEmail }).first();
}

async function getAll(pageNumber, limitAll){
    return await db(TABLE).offset((pageNumber * limitAll) - limitAll).limit(limitAll);
}

async function getCount() {
    return (await db(TABLE).count('*', { as: 'totalItems' }).first()).totalItems;
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
}