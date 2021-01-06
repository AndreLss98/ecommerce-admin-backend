const { INDECX_API_KEY } = process.env;

const axios = require('axios');
const moment = require('moment');
const bunyam = require('bunyan');
const ct = require('countries-and-timezones');
const cityTimezones = require('city-timezones');

const base_url = 'https://indecx.com/v2';

const log = bunyam.createLogger({
    name: 'IndeCX',
    streams: [
        {
            level: 'info',
            stream: process.stdout
        },
        {
            level: 'error',
            path: '/var/tmp/indecx-error.log'
        }
    ]
});

function setLocaleTimeOfAction(city_name, province_code, country_code) {
    let city = cityTimezones.lookupViaCity(city_name);
    if (!city.length) city = cityTimezones.findFromCityStateProvince(`${city_name} ${province_code}`);
    let timezone;
    if (city.length) {
        timezone = ct.getTimezone(city[0].timezone);
    } else if (ct.getCountry(country_code)) {
        timezone = ct.getTimezone(ct.getCountry(country_code).timezones[0]);
    }
    
    let hours = 10 - parseInt(((timezone? timezone.utcOffset : 0) / 60));
    
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
        log.error(error.response);
        throw error.response;
    });
}

module.exports = {
    registerAction,
    setLocaleTimeOfAction
}