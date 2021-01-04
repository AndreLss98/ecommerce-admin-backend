const { INDECX_API_KEY } = process.env;

const axios = require('axios');
const moment = require('moment');
const ct = require('countries-and-timezones');
const cityTimezones = require('city-timezones');

const base_url = 'https://indecx.com/v2';

function setLocaleTimeOfAction(city_name) {
    const city = cityTimezones.lookupViaCity(city_name);
    const timezone = ct.getTimezone(city[0].timezone);
    let hours = 10 + (timezone.utcOffset / 60);
    hours = `${('0' + hours).slice(-2)}:00:00.000`;
    
    let currentDate = moment().add(1, 'days');
    
    for (let qtdDias = 1; qtdDias < 5; null) {
        currentDate.add(1, 'day');
        if (currentDate.day() !== 0 && currentDate.day() !== 6) {
            ++qtdDias;
        }
    }

    currentDate = `${currentDate.format('YYYY-MM-DD')}`;
    return `${currentDate}T${hours}`;
}

async function registerAction(identificador, body, scheduling) {
    if (scheduling) body.scheduling = scheduling;
    await axios({
        method: 'POST',
        url: `${base_url}/send/${identificador}`,
        headers: {
            'company-key': INDECX_API_KEY,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(body)
    }).then(async (response) => {
       if (response.status == 200) {
        return true;
       } else {
        return false;
       }
    }).catch((error) => {
        throw error.data;
    });
}

module.exports = {
    registerAction,
    setLocaleTimeOfAction
}