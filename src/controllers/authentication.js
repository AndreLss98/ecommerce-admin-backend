const bcrypt = require('bcryptjs');
const routes = require('express').Router();
const UserRepository = require('../repositorys/user');
const authFunctions = require('./../shared/authentication');

const {
    SESS_ID,
    SESS_LIFETIME
} = process.env;

routes.post('/login', async (req, res, next) => {
    const { Email, Senha } = req.body;
    const user = await UserRepository.getAdminUser(Email);

    if (!user) return res.status(400).send({ error: "User not found" });
    if (!await bcrypt.compare(Senha, user.Hash)) return res.status(400).send({ error: "Invalid password" });

    if (user) {
        return res.cookie(SESS_ID, authFunctions.generateJWT({ userID: user.Id, userName: user.Nome }), {
            maxAge: parseInt(SESS_LIFETIME),
            httpOnly: true,
            sameSite: true,
            secure: false
        }).status(200).send({ Id: user.Id, Nome: user.Nome });
    } else {
        return res.status(400).send({ error: "Auth Failed" });
    }
});

routes.post('/signup', async (req, res, next) => {
    const { Email, Senha, Nome } = req.body;
    const checkUser = await UserRepository.getAdminUser(Email);
    if (checkUser) return res.status(400).send({ error: "User already exists" });

    try {
        return res.status(200).send(await UserRepository.saveAdminUser({ Email, Senha, Nome }));
    } catch (trace) {
        return res.status(400).send({ error: "Register Failed", trace });
    }
});

module.exports = app => app.use('/auth', routes);