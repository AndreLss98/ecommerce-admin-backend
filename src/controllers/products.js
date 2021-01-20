const { SHOPIFY_PRIVATE_APP_API_KEY, SHOPIFY_PRIVATE_APP_PASSWORD } = process.env;
const axios = require('axios');
const router = require('express').Router();

const webhookAuth = require('./../middlewares/webhookAuth');
const authMiddleware = require('./../middlewares/authentication');

const ProductsRepository = require('./../repositorys/products');

router.get('/bundle-products/:idBundle', async (req, res, next) => {
    return res.status(200).send(await ProductsRepository.getProductsOfBundle(req.params.idBundle));
});

router.get('/bundle/:handle', async (req, res, next) => {
    return res.status(200).send(await ProductsRepository.getBundle(req.params.handle));
});

router.get('/metafields', authMiddleware(), async (req, res, next) => {
    const id = parseInt(req.query.id);
    
    try {
        return res.status(200).send(await ProductsRepository.getMetafields(id));
    } catch(trace) {
        return res.status(400).send({ error: "Get metafield error", trace });
    }
});

router.post('/metafields/:id', authMiddleware(), async (req, res, next) => {
    const id = parseInt(req.params.id);
    const { version, logs } = req.body;
    
    let response;
    try {
        if (logs) {
            if (!logs.id) {
                const metafield = {
                    namespace: "history-log",
                    key: "log",
                    value: logs.value,
                    value_type: "string"
                }
    
                await axios({
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    url: `https://${SHOPIFY_PRIVATE_APP_API_KEY}:${SHOPIFY_PRIVATE_APP_PASSWORD}@leno-fx.myshopify.com/admin/api/2021-01/products/${id}/metafields.json`,
                    data: JSON.stringify({ metafield })
                }).then(async (res) => {
                    response = res.data;
                }, (error) => {
                    throw { error: error.response.data, status: error.response.status };
                });
            } else {
                const metafield = {
                    id: logs.id,
                    value: logs.value,
                    value_type: "string"
                }
    
                await axios({
                    method: 'put',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    url: `https://${SHOPIFY_PRIVATE_APP_API_KEY}:${SHOPIFY_PRIVATE_APP_PASSWORD}@leno-fx.myshopify.com/admin/api/2021-01/products/${id}/metafields/${logs.id}.json`,
                    data: JSON.stringify({ metafield })
                }).then(async (res) => {
                    response = res.data;
                }, (error) => {
                    throw { error: error.response.data, status: error.response.status };
                });
            }
        }

        if (version) {
            await ProductsRepository.update(id, { Version: version });
            response = { ...response, version };
        }
    } catch(trace) {
        return res.status(400).send({
            err: "Error save metafields",
            trace
        })
    }

    return res.status(200).send(response);
});


router.post('/bundle', authMiddleware(), async (req, res, next) => {
    const { BundleID, Products } = req.body;
    ProductsRepository.saveBundles(BundleID, Products);
    return res.status(200).send({ response: 'Ok' });
});

router.post('/webhook/product-update', webhookAuth(), async (req, res, next) => {
    const { id, title, handle, variants } = req.body;
    await ProductsRepository.update(id, { Title: title, Handle: handle, RetailPrice: variants[0].price });
    return res.status(200).send({ response: 'Webhook notificado com sucesso.' });
});

/**
 * Check if a user already purchase a plugin
 */
router.post('/validate-purchase', async (req, res, next) => {
    const { Customer, ItemID } = req.body;

    try {
        return res.status(200).send({
            response: await ProductsRepository.checkPurchase(Customer, ItemID)
        });
    } catch (trace) {
        return res.status(400).send({
            message: "Error on validate purchase",
            trace
        })
    }
});

module.exports = app => app.use('/products', router);