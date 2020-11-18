require('dotenv').config();
const axios = require('axios');

const db = require('./../configs/knex');

function printUrl(url) {
    console.log(`Url -> ${url}`);
}

async function updateProductName() {
    const products = await db('ProductLookup');

    console.log('---------- Inicio --------');
    for (let product of products) {
        const url = `https://lenofx.com/products/${product.Handle}.json`;
        
        await axios({
            method: 'get',
            url
        }).then(async ({ data }) => {
            try {
                await db('ProductLookup').update({ Title: data.product.title }).where({ ProductID: product.ProductID });
            } catch (error) {
                printUrl(url);
                console.log('Error on db query:');
                console.log(error);
                console.log('--------------------------------');
            }
        }).catch(({ response, request, message }) => {
            printUrl(url);
            if (response) {
                console.log('Request is made and server responded:');
                if (response.data) console.log(response.data);
                console.log(`Response status: ${response.status}`);
                if (response.status === 404) console.log('Produto não encontrado.')
            } else if (request) {
                console.log('Request is made but server not answered:');
                console.log(request);
            } else if (message) {
                console.log('Request not maded:');
                console.log(message);
            }
            console.log('--------------------------------');
        });
    }
};

updateProductName().then(() => {
    console.log('Programa finalizado com sucesso.');
}).catch((error) => {
    console.log('Programa finalizado com erro: ', error);
}).finally(() => {
    process.exit(0);
});