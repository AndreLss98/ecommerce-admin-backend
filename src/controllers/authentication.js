const routes = require('express').Router();
const user = require('../repositorys/user');
const authFunctions = require('./../shared/authentication');

const {
    SESS_ID,
    SESS_LIFETIME
} = process.env;

const _mockUsers = [
    { id: 1, name: 'André Luís', email: 'andre@gmail.com', senha: '123456' }
];

routes.post('/login', async (req, res, next) => {
    const { email, senha } = req.body;
    const userExists = _mockUsers.find(user => user.email === email && user.senha === senha);

    if (userExists) {
        return res.cookie(SESS_ID, authFunctions.generateJWT({ userID: user.id }), {
            maxAge: parseInt(SESS_LIFETIME),
            httpOnly: true,
            sameSite: true,
            secure: false
        }).status(200).send({ userID: userExists.id });
    } else {
        return res.status(400).send({ error: "Auth Failed" });
    }
});

module.exports = app => app.use('/auth', routes);