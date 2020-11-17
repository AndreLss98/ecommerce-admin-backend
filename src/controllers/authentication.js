const bcrypt = require('bcryptjs');
const routes = require('express').Router();
const UserRepository = require('../repositorys/user');
const authentication = require('./../middlewares/authentication');
const authFunctions = require('./../shared/authentication');

const {
    SESS_ID,
    ENV,
    SESS_LIFETIME
} = process.env;

routes.post('/login', async (req, res, next) => {
    const { Email, Senha } = req.body;
    const user = await UserRepository.getAdminUser({ Email });

    if (!user) return res.status(400).send({ message: "Usuário não encontrado." });
    if (!await bcrypt.compare(Senha, user.Hash)) return res.status(400).send({ message: "Senha inválida" });
    if (!user.Aceito) return res.status(400).send({ message: "Cadastro em análise" });

    if (user) {
        return res.cookie(SESS_ID, authFunctions.generateJWT({ userID: user.Id, userName: user.Nome }), {
            maxAge: parseInt(SESS_LIFETIME),
            httpOnly: true,
            sameSite: 'lax',
            secure: ENV === 'prod'? true : false,
        }).status(200).send({ Id: user.Id, Nome: user.Nome, ExpiresAt: parseInt(SESS_LIFETIME) });
    } else {
        return res.status(400).send({ message: "Falha na autenticação." });
    }
});

routes.post('/signup', async (req, res, next) => {
    const { Email, Senha, Nome } = req.body;
    const checkUser = await UserRepository.getAdminUser(Email);
    if (checkUser) return res.status(400).send({ message: "Usuário já cadastrado" });

    try {
        return res.status(200).send(await UserRepository.saveAdminUser({ Email, Senha, Nome }));
    } catch (trace) {
        return res.status(400).send({ message: "Falha no cadastro", trace });
    }
});

routes.post('/refresh-session', authentication(), async (req, res, next) => {
    return res.cookie(SESS_ID, authFunctions.generateJWT({ userID: req.user.Id, userName: req.user.Nome }), {
        maxAge: parseInt(SESS_LIFETIME),
        httpOnly: true,
        sameSite: 'lax',
        secure: ENV === 'prod'? true : false,
    }).status(200).send({ Id: req.user.Id, Nome: req.user.Nome, ExpiresAt: parseInt(SESS_LIFETIME) });
});

module.exports = app => app.use('/auth', routes);