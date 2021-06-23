const {
    SHOPIFY_PRIVATE_APP_API_KEY,
    SHOPIFY_PRIVATE_APP_PASSWORD
} = process.env;

const axios = require('axios');
const knex = require('./../configs/knex');
const db = require('./../configs/knex');

const TABLE = 'ProductLookup';
const RELATION_BUNDLE_TABLE = 'BundleProduct';

async function getProductsOfBundle(BundleProductID) {
    const productsIDS = await db.select('ProductID').from(RELATION_BUNDLE_TABLE).where({ BundleProductID });
    let products = [];

    for (let { ProductID } of productsIDS) {
        const temp = await db.select('ProductID', 'Handle', 'Title').from(TABLE).where({ ProductID }).first();
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
    try {
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
    } catch (error) {
        throw error;
    }
}

async function update(ProductID, Product) {
    try {
        Product.UpgradedVersionAt = knex.fn.now();
        return await db(TABLE).update(Product).where({ ProductID });
    } catch (error) {
        throw error;
    }
}

async function checkPurchase(Customer, ItemID) {
    try {
        const check = await db('DownloadLinks').where({ Customer, ItemID });
        return check.length == 0 ? false : true;
    } catch (error) {
        throw error;
    }
}

async function getMetafields(id) {
    try {
        return await axios({
            method: 'get',
            url: `https://${SHOPIFY_PRIVATE_APP_API_KEY}:${SHOPIFY_PRIVATE_APP_PASSWORD}@leno-fx.myshopify.com/admin/api/2021-01/products/${id}/metafields.json`
        }).then(async (response) => {
            let { metafields } = response.data;
            return metafields;
        }, (error) => {
            throw { error: error.response.data, status: error.response.status };
        });
    } catch (error) {
        throw error;
    }
}

async function getById(ProductID) {
    try {
        return await db(TABLE).where({ ProductID }).first();
    } catch (error) {
        throw error;
    }
}

async function getAll() {
    try {
        return await db(TABLE);
    } catch (eror) {
        throw error;
    }
}

module.exports = {
    getAll,
    update,
    getById,
    getBundle,
    saveBundles,
    checkPurchase,
    getMetafields,
    getProductsOfBundle,
}