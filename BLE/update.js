const axios = require('axios');
require('dotenv').config();
const axiosRetry = require('axios-retry');
const appURL = process.env.APP_URL;

axiosRetry(axios, {
  retries: 3, // Number of retries
  retryCondition: (error) => {
    return error.response && error.response.status === 503; // Retry only for 503 Service Unavailable
  },
  retryDelay: (retryCount) => {
    return retryCount * 1000; // Delay between retries, in milliseconds
  }
});

async function update(beacon, time, location) {
  
  let entry = {
    tag: beacon.tag,
    uuid: beacon.uuid,
    location,
    time
  }
  if (beacon.tag !== "-") {
    axios.post(`${appURL}/entry`, entry)
    .then(response => {
      console.log('Success:', response.data);
    })
    .catch(error => console.error(error));
  }
  console.log("update sent")
  
}

module.exports = {
  update,
}
