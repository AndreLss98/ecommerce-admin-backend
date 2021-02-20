const bunyam = require('bunyan');
const router = require('express').Router();

const indecx = require('./../shared/indeCX');
const webhookAuth = require('./../middlewares/webhookAuth');

const UserRepository = require('./../repositorys/user');
const ProductRepository = require('./../repositorys/products');
const OrderRepository = require('./../repositorys/download_url');

const log = bunyam.createLogger({
    name: 'Order',
    streams: [
        {
            level: 'info',
            stream: process.stdout
        },
        {
            level: 'error',
            path: '/var/tmp/order-error.log'
        }
    ]
});

router.post('/webhook/order-create', async (req, res, next) => {
    const {
        id,
        created_at,
        name,
        total_price,
        line_items, customer
    } = req.body;
    const user = await UserRepository.getByEmail(customer.email);
    
    try {
        for (let product of line_items) {
            if (product.title.toLowerCase().includes('pack')) {
                const productsOfBundle = await ProductRepository.getProductsOfBundle(product.product_id);
                for (let subProduct of productsOfBundle) {
                    await OrderRepository.registerOrder(
                        customer.id,
                        subProduct.ProductID, id,
                        subProduct.Title,
                        product.product_id, 0);
                }
            } else {
                await OrderRepository.registerOrder(
                    customer.id,
                    product.product_id, id,
                    product.title,
                    product.product_id, 0);
            }
        }
    } catch (trace) {
        log.error(trace);
        return res.status(400).send({
           message: "Order create failed",
           trace
        });
    }

    try {
        for (let product of line_items) {
            await indecx.registerAction('MEA30N', {
                nome: `${customer.first_name} ${customer.last_name}`,
                email: customer.email,
                telefone: '',
                product: product.title,
                country: customer.default_address.country,
                order_name: name,
                day: created_at.substr(0, created_at.lastIndexOf('T')),
            }, indecx.setLocaleTimeOfAction(customer.default_address.city, customer.default_address.province_code, customer.default_address.country_code));
        }
    } catch (trace) {
        log.error(trace);
    }

    return res.status(200).send(user);
});

module.exports = app => app.use('/order', router);