const router = require('express').Router();

const ProductsRepository = require('./../repositorys/products');

router.get('/bundle-products/:idBundle', async (req, res, next) => {
    return res.status(200).send(await ProductsRepository.getProductsOfBundle(req.params.idBundle));
});

router.get('/bundle/:handle', async (req, res, next) => {;
    return res.status(200).send(await ProductsRepository.getBundle(req.params.handle));
});

module.exports = app => app.use('/products', router);