const jwt = require('jsonwebtoken');

const {
    SESS_LIFETIME,
    SESS_SECRET_KEY,
} = process.env;

function generateJWT(params = {}) {
    return jwt.sign(params, SESS_SECRET_KEY, {
        expiresIn: SESS_LIFETIME 
    });
}

module.exports = {
    generateJWT
}