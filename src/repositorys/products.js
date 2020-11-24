const axios = require('axios');
const db = require('./../configs/knex');

const TABLE = 'ProductLookup';
const RELATION_BUNDLE_TABLE = 'BundleProduct';

async function getProductsOfBundle(BundleProductID) {
    const productsIDS = await db.select('ProductID').from(RELATION_BUNDLE_TABLE).where({ BundleProductID });
    let products = [];

    for (let { ProductID } of productsIDS) {
        const temp = await db.select('ProductID', 'Handle').from(TABLE).where({ ProductID }).first();
        if(temp) products.push(temp);
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

async function saveBundles(BundleProductID, Products) {
    const oldProducts = (await db.select('ProductID').from(RELATION_BUNDLE_TABLE).where({ BundleProductID }))
        .map(el => el.ProductID);

    const forSave = Products.filter(el => !oldProducts.includes(el));
    const forDelete = oldProducts.filter(el => !Products.includes(el));
    
    for (let ProductID of forSave) {
        await db(RELATION_BUNDLE_TABLE).insert({ BundleProductID, ProductID });
    }

    for (let ProductID of forDelete) {
        await db(RELATION_BUNDLE_TABLE).where({ BundleProductID, ProductID }).delete();
    }
}

async function updateFromWebHook(ProductID, Product) {
    try {
        return await db(TABLE).update(Product).where({ ProductID });
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getBundle,
    saveBundles,
    updateFromWebHook,
    getProductsOfBundle,
}