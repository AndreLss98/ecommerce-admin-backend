const bunyam = require('bunyan');
const routes = require('express').Router();

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

module.exports = app => app.use('/credits', routes);