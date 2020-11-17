const router = require('express').Router();

const authMiddleware = require('./../middlewares/authentication');

const ProductsRepository = require('./../repositorys/products');

router.get('/bundle-products/:idBundle', async (req, res, next) => {
    return res.status(200).send(await ProductsRepository.getProductsOfBundle(req.params.idBundle));
});

router.get('/bundle/:handle', authMiddleware(), async (req, res, next) => {
    return res.status(200).send(await ProductsRepository.getBundle(req.params.handle));
});

router.post('/bundle', async (req, res, next) => {
    const { BundleID, Products } = req.body;
    ProductsRepository.save(BundleID, Products);
    return res.status(200).send({ response: 'Ok' });
});

module.exports = app => app.use('/products', router);