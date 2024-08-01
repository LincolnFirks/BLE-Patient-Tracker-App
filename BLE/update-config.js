const fs = require("fs");
const axios = require('axios');
const getMAC = require("getmac").default;
const localMAC = getMAC();
require('dotenv').config();

async function configure() {
  const config = JSON.parse(fs.readFileSync('./config.json')); // get current local 

  let postData = {
    address: localMAC,
  }
  const response = await axios.post(`${process.env.APP_URL}/config-update`, postData)
    .catch(error => {
      console.log(error)
      return;
    });

  let DBConfig = null;

  try { 
    DBConfig = response.data;
  } catch(error) {
    console.log("Couldn't fetch config")
  }

  if (DBConfig) {
    if (JSON.stringify(DBConfig) !== JSON.stringify(config)) {
      fs.writeFileSync('config.json', JSON.stringify(DBConfig), "utf-8");
    }
  } // local and database don't match, rewrite local
  
}

function CheckConfig(interval) {
  setInterval(configure, interval);
} // check local and database config against eachother on interval

module.exports = {
  CheckConfig
}