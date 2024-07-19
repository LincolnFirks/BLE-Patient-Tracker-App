const config = require("./config.json")
const axios = require('axios');

async function update(beacon, time, location, config) {
  
  let entry = {
    tag: beacon.tag,
    uuid: beacon.uuid,
    location,
    time
  }
  if (beacon.tag !== "-") {
    axios.post(`${config.appURL}/entry`, entry)
      .catch(error => console.error(error));

  }
  
}


module.exports = {
  update,
}
