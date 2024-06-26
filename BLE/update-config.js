const fs = require("fs");
const axios = require('axios');
const getMAC = require("getmac").default;
const localMAC = getMAC();

async function configure() {
  const config = JSON.parse(fs.readFileSync('./config.json')); // get current local 

  let postData = {
    address: localMAC,
  }
  const response = await axios.post(`${config.serverURL}/config-update`, postData)
    .catch(error => console.error(error));

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