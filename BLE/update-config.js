const { client } = require("./update");
const fs = require("fs");
const axios = require('axios');
const getMAC = require("getmac").default;
const localMAC = getMAC();



async function initialize() {

  const config = JSON.parse(fs.readFileSync('./config.json'));
  const myDB = client.db(config.database);
  const DBConfigCollection = myDB.collection(config.ConfigCollection);
  const DBConfig = await DBConfigCollection.findOne();

  
  
  if (DBConfig) {
    
   
    if (JSON.stringify(DBConfig) !== JSON.stringify(config)) {
      fs.writeFileSync('config.json', JSON.stringify(DBConfig), "utf-8");
      console.log("config Change made")
    }
  }
  
  let postData = {
    scannerMAC: localMAC,
    time: new Date()
  }
  axios.post(`${config.serverURL}/config-update`,postData)
    .catch(error => console.error(error));

}

function checkDB(interval) {
  setInterval(initialize, interval);
}

module.exports = {
  initialize,
  checkDB
}