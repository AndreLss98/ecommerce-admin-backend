const axios = require('axios');
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

async function getBundle(BundleHandle) {
    return await axios({
        method: 'get',
        url: `https://lenofx.com/products/${BundleHandle}.json`
    }).then(async (response) => {
        let bundle = response.data.product;
        bundle.plugins = await getProductsOfBundle(bundle.id);
        return bundle;
    }, (error) => {
        throw error.data;
    });
}

module.exports = {
    getProductsOfBundle,
    getBundle
}