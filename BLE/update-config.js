const fs = require("fs");
const axios = require('axios');
const getMAC = require("getmac").default;
const localMAC = getMAC();
require('dotenv').config();
const axiosRetry = require('axios-retry');

axiosRetry(axios, {
  retries: 3, // Number of retries
  retryCondition: (error) => {
    return error.response && error.response.status === 503; // Retry only for 503 Service Unavailable
  },
  retryDelay: (retryCount) => {
    return retryCount * 1000; // Delay between retries, in milliseconds
  }
});

const appURL = process.env.APP_URL;

async function configure() {
  const config = JSON.parse(fs.readFileSync('./config.json')); // get current local 

  let postData = {
    address: localMAC,
  }
  const response = await axios.post(`${appURL}/config-update`, postData)
    .then(response => {
      console.log('Success:', response.data);
    })
    .catch(error => {
      console.error(error);
      return;
    });

  const DBConfig = response.data;


  if (DBConfig) {
    if (JSON.stringify(DBConfig) !== JSON.stringify(config)) {
      fs.writeFileSync('config.json', JSON.stringify(DBConfig), "utf-8");
      console.log("config Change made")
    }
  } // local and database don't match, rewrite local
  
 

}

function checkDB(interval) {
  setInterval(configure, interval);
} // check local and database config against eachother on interval

module.exports = {
  configure,
  checkDB
}