const { SHOPIFY_PRIVATE_APP_API_KEY, SHOPIFY_PRIVATE_APP_PASSWORD } = process.env;
const axios = require('axios');
const multer = require('multer');
const multerConfig = require('./../configs/multerConfig');
const router = require('express').Router();

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
            if (!logs.id && logs.value) {
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
                }).then(async (data) => {
                    response = data.data;
                }, (error) => {
                    throw { error: error.response.data, status: error.response.status };
                });
            } else if (logs.id && logs.value) {
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
                }).then(async (data) => {
                    response = data.data;
                }, (error) => {
                    throw { error: error.response.data, status: error.response.status };
                });
            }
        }

        if (version) {
            await ProductsRepository.update(id, { Version: version });
            response = { ...response, version, UpgradedVersionAt: new Date() };
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

/**
 * Endpoint para o site pode validar a versao atual do plugin
 */
router.get('/:id/version', async (req, res, next) => {
    const id = parseInt(req.params.id);

    try {
        const product = await ProductsRepository.getById(id);
        return res.status(200).send({ version: product.Version });
    } catch (trace) {
        return res.status(400).send({ err: "Error get product version", trace });
    }
});


/**
 * Send files to s3 and update filename
 */
router.post('/upload-file/:id', multer(multerConfig()).single('file'), async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).send({ message: "Id is required" });

    try {
        await ProductsRepository.update(id, { FileName: req.file.originalname });
        return res.status(200).send({ message: "File save" });
    } catch(error) {
        return res.status(400).send({ message: "Erro save file", error });
    }
});

module.exports = app => app.use('/products', router);