const router = require('express').Router();

const webhookAuth = require('./../middlewares/webhookAuth');

const UserRepository = require('./../repositorys/user');
const ProductRepository = require('./../repositorys/products');
const OrderRepository = require('./../repositorys/download_url');

router.post('/webhook/order-create', webhookAuth(), async (req, res, next) => {
    const { id, line_items, customer } = req.body;
    try {
        const user = await UserRepository.getByEmail(customer.email);
        for (let product of line_items) {
            if (product.title.toLowerCase().includes('pack')) {
                const productsOfBundle = await ProductRepository.getProductsOfBundle(product.product_id);
                for (let subProduct of productsOfBundle) {
                    await OrderRepository.registerOrder(
                        customer.id,
                        subProduct.ProductID, id,
                        subProduct.Title,
                        product.product_id, 0,
                        user.Subscriber);
                }
            } else {
                await OrderRepository.registerOrder(
                    customer.id,
                    product.product_id, id,
                    product.title,
                    product.product_id, 0,
                    user.Subscriber);
            }
        }
        return res.status(200).send(user);
    } catch (trace) {
        return res.status(400).send({
           message: "Order create failed",
           trace
        });
    }
});

module.exports = app => app.use('/order', router);