const crypto = require('crypto');

const {
    SHOPIFY_WEBHOOK_TOKEN
} = process.env;

module.exports = () => {
    return async (req, res, next) => {
        let hmac = crypto.createHmac('sha256', SHOPIFY_WEBHOOK_TOKEN).update(req.rawBody).digest('base64');
        if (hmac === req.headers['x-shopify-hmac-sha256']) {
            next();
        } else {
            res.status(401).send({ message: "Invalid key" });
        }
    }
}