const { client } = require("./update");
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
let beaconData = JSON.parse(fs.readFileSync("beacons.json", "utf-8"));

async function initialize() {
  const myDB = client.db(config.database);
  const nameCollection = myDB.collection(config.CurrentBeaconsCollection);
  const currentBeaconsDB = await nameCollection.findOne();
  const beaconsArray = currentBeaconsDB.beacons;

  if (JSON.stringify(beaconsArray) !== JSON.stringify(beaconData.beacons)) {
    fs.writeFileSync('beacons.json', JSON.stringify(currentBeaconsDB), "utf-8");
    beaconData = JSON.parse(fs.readFileSync("beacons.json", "utf-8"));
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