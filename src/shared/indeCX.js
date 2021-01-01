const { INDECX_API_KEY } = process.env;
const axios = require('axios');

const base_url = 'https://indecx.com/v2';

async function registerAction(identificador, body, scheduling) {
    if (scheduling) body.scheduling = scheduling;
    console.log(body);
    /* await axios({
        method: 'POST',
        url: `${base_url}/send/${identificador}`,
        headers: {
            'company-key': INDECX_API_KEY
        },
        data: body
    }).then(async (response) => {
       if (response.status == 200) {
        return true;
       } else {
        return false;
       }
    }); */
}

module.exports = {
    registerAction
}