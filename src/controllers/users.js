const routes = require('express').Router();

const Users = require('./../repositorys/user');
const DownloadLinksRepository = require('./../repositorys/download_url');

const authMiddleware = require('./../middlewares/authentication');

/**
 * ToDo: Check if can remove this endpoint
 */
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

routes.delete('/plugins/:id', async (req, res, next) =>  {
    const { id } = req.params;
    try {
        await DownloadLinksRepository.deleteByLinkID(id);
        return res.status(200).send({ message: "Plugin excluído do historico com sucesso" });
    } catch(error) {
        return res.status(400).send({ message: "Erro ao excluir plugin do historico", error });
    }
});

module.exports = app => app.use('/users', routes);