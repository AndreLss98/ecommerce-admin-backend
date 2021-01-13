const {
    BACKEND_URL
} = process.env;

const fs = require('fs');
const moment = require('moment');
const bunyam = require('bunyan');
const jsonExporter = require('jsonexport');
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

routes.post('/generate-csv', async (req, res, next) => {
    try {
        jsonExporter(req.body, (error, csv) => {
            if (error) return log.error(error);
            const reportName = `${moment().format()}-relatorio.csv`;
            fs.writeFileSync(`./public/tmp/csv/${reportName}`, csv);
            return res.status(200).send({ reportUrl: `${BACKEND_URL}/reports/${reportName}` });
        });
    } catch(trace) {
        return res.status(400).send({ trace })
    }
});

module.exports = app => app.use('/credits', routes);