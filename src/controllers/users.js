const routes = require('express').Router();

const Users = require('./../repositorys/user');

routes.get('/:email', async (req, res, next) => {
    const user = await Users.getByEmail(req.params.email);
    if (!user) return res.status(404).send({ error: "User not found" });
    return res.status(200).send(user);
});

module.exports = app => app.use('/users', routes);