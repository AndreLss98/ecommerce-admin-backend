const routes = require('express').Router();

const Users = require('./../repositorys/user');

const authMiddleware = require('./../middlewares/authentication');

routes.get('/:email', async (req, res, next) => {
    const user = await Users.getByEmail(req.params.email);  
    if (!user) return res.status(404).send({ error: "User not found" });
    return res.status(200).send(user);
});

routes.put('/credits/:CustomerID', authMiddleware(), async(req, res, next) => {
    const { CustomerID } = req.params;
    const { Credits } = req.body;
    try {
        const response = await Users.setCreditsOfUser(CustomerID, Credits);
        return res.status(200).send({ response });
    } catch(trace) {
        return res.status(400).send({ message: 'Update failed', trace });
    }
});

module.exports = app => app.use('/users', routes);