const jwt = require('jsonwebtoken');

const {
    SESS_LIFETIME,
    SESS_SECRET_KEY,
} = process.env;

function generateJWT(params = {}) {
    return jwt.sign(params, SESS_SECRET_KEY, {
        expiresIn: parseInt(SESS_LIFETIME) / 1000
    });
}

function decodeJwtToken(token) {
    return jwt.decode(token);
}

module.exports = {
    generateJWT,
    decodeJwtToken,
}