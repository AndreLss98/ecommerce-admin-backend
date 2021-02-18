const bunyam = require('bunyan');
const router = require('express').Router();

const authMiddleware = require('./../middlewares/authentication');

const CreditRepository = require('./../repositorys/credits');

const log = bunyam.createLogger({
    name: 'Credits',
    streams: [
        {
            level: 'info',
            stream: process.stdout
        },
        {
            level: 'error',
            path: '/var/tmp/credits-error.log'
        }
    ]
});

router.put('/alter-plugin', async (req, res, next) => {
    const { email, oldPlugin, newPlugin } = req.body;
    if (!email) return res.status(400).send({ message: "User email is required" });
    if (!oldPlugin) return res.status(400).send({ message: "Old plugin is required" });
    if (!newPlugin) return res.status(400).send({ message: "New plugin is required" });

    await CreditRepository.alterPluginUsage(email, oldPlugin, newPlugin);
    return res.status(200).send(newPlugin);
});

module.exports = app => app.use('/credits', router);