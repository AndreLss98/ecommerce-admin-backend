const { INDECX_API_KEY } = process.env;

const axios = require('axios');
const cityTimezones = require('city-timezones');
const ct = require('countries-and-timezones');

const base_url = 'https://indecx.com/v2';

function seLocaleTimeOfAction(city_name) {
    const city = cityTimezones.lookupViaCity(city_name);
    const timezone = ct.getTimezone(city[0].timezone);
    const hours = 10 + (timezone.utcOffset / 60);

    console.log(`2020-12-01T${('0' + hours).slice(-2)}:00:00.000`);
}

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
    registerAction,
    seLocaleTimeOfAction
}