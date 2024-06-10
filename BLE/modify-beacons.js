const { client } = require("./update");
const fs = require("fs");
const config = require('./config.json')


async function initialize() {
  const myDB = client.db(config.database);
  const nameCollection = myDB.collection(config.CurrentBeaconsCollection);
  const currentBeaconsDB = await nameCollection.findOne();
  
  if (!currentBeaconsDB) return;

  let localBeaconData = (JSON.parse(fs.readFileSync("beacons.json", "utf-8"))).beacons;
  const compareLocal = localBeaconData.map(beacon => {
    const { location, ...rest } = beacon;
    return rest;
  })
  const compareDB = currentBeaconsDB.beacons.map(beacon => {
    const { location, ...rest } = beacon;
    return rest;
  })

  if (JSON.stringify(compareLocal) !== JSON.stringify(compareDB)) {
    fs.writeFileSync('beacons.json', JSON.stringify(currentBeaconsDB), "utf-8");
    console.log("Database Change made")
  }
}



function checkDB(interval) {
  setInterval(initialize, interval);
}

module.exports = {
  initialize,
  checkDB
}