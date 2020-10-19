require('dotenv').config();

const { 
    PORT
} = process.env;

const bodyParser = require('body-parser');

const express = require('express');
const app = express();
const { graphqlHTTP } = require('express-graphql');

const schema = require('./configs/graphql_schema');
app.use('/api', graphqlHTTP({ schema, graphiql: true }));

app.use(bodyParser.json());
require('./controllers')(app);

app.listen(PORT, () => {
    console.log(`App listen on port ${PORT}`);
});