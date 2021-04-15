const routes = require('express').Router();

const Users = require('./../repositorys/user');
const CreditsRepository = require('./../repositorys/credits');
const ProductRepository = require('./../repositorys/products');
const DownloadLinksRepository = require('./../repositorys/download_url');

const authMiddleware = require('./../middlewares/authentication');

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

routes.post('/plugins/:id', async (req, res, next) => {
    let { id } = req.params;
    let { CustomerID } = req.body;
    id = parseInt(id);
    CustomerID = parseInt(CustomerID);
    try {
        const product = await ProductRepository.getById(id);
        await DownloadLinksRepository.registerOrder(CustomerID, id, null, product.Title, id, 0);
        return res.status(201).send({ message: "Plugin inserido na conta do usuário." });
    } catch(error) {
        return res.status(400).send({ message: "Erro ao inserir plugin na conta do usuário ", error });
    }
});

routes.put('/plugins/:id', async (req, res, next) => {
    let { id } = req.params;
    let { CustomerID, newPlugin, oldPlugin } = req.body;
    
    id = parseInt(id);
    oldPlugin = parseInt(oldPlugin);
    CustomerID = parseInt(CustomerID);

    try {
        await DownloadLinksRepository.alterPluginFromLink(id, newPlugin);
        await CreditsRepository.alterCreditUsageLog(CustomerID, oldPlugin, newPlugin);
        return res.status(200).send({ message: "Plugin alterado na conta do usuário." });
    } catch(error) {
        console.log(error);
        return res.status(400).send({ message: "Erro ao alterar plugin na conta do usuário ", error });
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