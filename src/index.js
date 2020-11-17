require('dotenv').config();

const { 
    PORT
} = process.env;

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const app = express();
const { graphqlHTTP } = require('express-graphql');

const hostsWhiteList = [
    'http://localhost:4200'
];

app.use(async (req, res, next) => {
    console.log(req.cookies);
    next();
})

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

const schema = require('./configs/graphql_schema');
app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));

app.use(bodyParser.json());
require('./controllers')(app);

app.listen(PORT, () => {
    console.log(`App listen on port ${PORT}`);
});