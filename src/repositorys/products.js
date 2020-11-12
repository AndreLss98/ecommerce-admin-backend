const db = require('./../configs/knex');

const TABLE = 'ProductLookup';
const RELATION_BUNDLE_TABLE = 'BundleProduct';

async function getProductsOfBundle(BundleProductID) {
    const productsIDS = await db.select('ProductID').from(RELATION_BUNDLE_TABLE).where({ BundleProductID });
    let products = [];

    for (let { ProductID } of productsIDS) {
        products.push(await db.select('ProductID', 'Handle').from(TABLE).where({ ProductID }).first());
    }

    return products;
}

module.exports = {
    getProductsOfBundle
}