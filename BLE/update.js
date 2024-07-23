const config = require("./config.json")
const axios = require('axios');
require('dotenv').config();

const appURL = process.env.APP_URL;

async function update(beacon, time, location, config) {
  
  let entry = {
    tag: beacon.tag,
    uuid: beacon.uuid,
    location,
    time
  }
  if (beacon.tag !== "-") {
    axios.post(`${appURL}/entry`, entry)
      .catch(error => console.error(error));

  }
  
}

module.exports = {
  update,
}
