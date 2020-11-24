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

router.post('/bundle', authMiddleware(), async (req, res, next) => {
    const { BundleID, Products } = req.body;
    ProductsRepository.saveBundles(BundleID, Products);
    return res.status(200).send({ response: 'Ok' });
});

router.post('/webhook/product-update', webhookAuth(), async (req, res, next) => {
    const { id, title, handle, variants } = req.body;
    await ProductsRepository.updateFromWebHook(id, { Title: title, Handle: handle, RetailPrice: variants[0].price });
    return res.status(200).send({ response: 'Webhook notificado com sucesso.' });
});

module.exports = app => app.use('/products', router);