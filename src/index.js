require('dotenv').config();

const { 
    PORT
} = process.env;

const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const { graphqlHTTP } = require('express-graphql');

const hostsWhiteList = [
    'http://localhost:4200',
    'https://painel.lenofx.com',
    'https://lenofx.com'
];

app.use(helmet());
app.use(cors({
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, Access-Control-Allow-Credentials',
    origin: function (origin, callback) {
        if (hostsWhiteList.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not Allowed by CORS'));
        }
    }
}));
app.use(cookieParser());

const schema = require('./configs/graphql_schema');
app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));

app.use(bodyParser.json({
    verify: (req, res, buffer, enconding) => {
        if (buffer && buffer.length) {
            req.rawBody = buffer.toString(enconding || 'utf8');
        }
    }
}));

require('./controllers')(app);

app.listen(PORT, () => {
    if (!fs.existsSync('./public/tmp/csv/')) {
        fs.mkdirSync('./public/tmp/csv/', { recursive: true });
    }

    console.log(`App listen on port ${PORT}`);
});