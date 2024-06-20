const config = require("./config.json")
const axios = require('axios');

async function update(beacon, time, location, config) {
  
  let entry = {
    beaconID: beacon.ID,
    name: beacon.name,
    address: beacon.address,
    location,
    time
  }
  if (beacon.name !== "-") {
    axios.post(`${config.serverURL}/entry`, entry)
      .catch(error => console.error(error));

  }
  
}


module.exports = {
  update,
}
