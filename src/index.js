require('dotenv').config();

const { 
    PORT
} = process.env;

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const app = express();
const { graphqlHTTP } = require('express-graphql');

app.use(cors());

const schema = require('./configs/graphql_schema');
app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));

app.use(bodyParser.json());
require('./controllers')(app);

app.listen(PORT, () => {
    console.log(`App listen on port ${PORT}`);
});