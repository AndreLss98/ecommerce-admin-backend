const jwt = require('jsonwebtoken');
const { ENVS } = require('../shared/constantes');

const userRepository = require('./../repositorys/user');

const authFunctions = require('./../shared/authentication');

const {
    ENV,
    SESS_ID,
    SESS_SECRET_KEY
} = process.env;

module.exports = () => {
    return async (req, res, next) => {
        if (ENV === ENVS.PROD) {
            const token = req.cookies[SESS_ID];
            if (!token) return res.status(401).send({ message: "Nenhum token foi encontrado." });
            const userJWT = authFunctions.decodeJwtToken(token);
            const user = await userRepository.getAdminUser({ Id: userJWT.userID });
    
            if (!user) return res.status(404).send({ message: "Usuário não encontrado." });
            if (!user.Aceito) return res.status(401).send({ message: "Seu cadastro ainda não foi aprovado para utilizar esse recurso." });
    
            jwt.verify(token, SESS_SECRET_KEY, (error, decoded) => {
                if (error) return res.status(401).send({ message: "Token inválido." });
                req.user = user;
                return next();
            });

        } else if (ENV === ENVS.DEV) {
            return next();
        }
    }
}