const { client } = require("./update");
const fs = require("fs");
const axios = require('axios');
const getMAC = require("getmac").default;
const localMAC = getMAC();

async function configure() {
  const config = JSON.parse(fs.readFileSync('./config.json')); // get current local config
  const myDB = client.db(config.database);
  const DBConfigCollection = myDB.collection(config.ConfigCollection);
  const DBConfig = await DBConfigCollection.findOne(); // get config from database

  if (DBConfig) {
    if (JSON.stringify(DBConfig) !== JSON.stringify(config)) {
      fs.writeFileSync('config.json', JSON.stringify(DBConfig), "utf-8");
      console.log("config Change made")
    }
  } // local and database don't match, rewrite local
  
  let postData = {
    scannerMAC: localMAC,
    time: new Date()
  }
  axios.post(`${config.serverURL}/config-update`,postData)
    .catch(error => console.error(error));
  // post to server that config was updated
}

function checkDB(interval) {
  setInterval(configure, interval);
} // check local and database config against eachother on interval

module.exports = {
  configure,
  checkDB
}