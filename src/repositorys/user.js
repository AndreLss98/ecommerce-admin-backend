const db = require('./../configs/knex');
const bcrypt = require('bcryptjs');

const TABLE = 'Customers';
const ADMIN_TABLE = 'AdminUser';

async function getByEmail(CustomerEmail) {
    return await db(TABLE).where({ CustomerEmail }).first();
}

async function getAdminUser(Email) {
    return await db(ADMIN_TABLE).where({ Email }).first();
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

module.exports = {
    getByEmail,
    getAdminUser,
    saveAdminUser
}