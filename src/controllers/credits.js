const {
    BACKEND_URL
} = process.env;

const fs = require('fs');
const moment = require('moment');
const bunyam = require('bunyan');
const routes = require('express').Router();
const reportExporter = require('export-from-json');
const { response } = require('express');

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

routes.post('/generate-report', async (req, res, next) => {
    const exportType = req.query.type;
    if (!exportType) return res.status(400).send({ error: "Report type is required." });
    const report = reportExporter({
        data: req.body,
        fileName: `relatorio-${moment().format()}`,
        exportType,
        processor (content, type, fileName) {
            switch (type) {
                case 'csv':
                    res.setHeader('Content-Type', 'text/csv');
                    break;
                case 'xls':
                    res.setHeader('Content-Type', 'application/ms-excel');
                    break;
            }
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            return content;
        }
    });
    res.write(report);
    res.end();
});

module.exports = app => app.use('/credits', routes);