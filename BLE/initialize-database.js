const fs = require("fs");
const { client } = require("./update");
const config = require("./config.json")

const myDB = client.db(config.database);
const ConfigCollection = myDB.collection(config.ConfigCollection);
const currentBeaconCollection = myDB.collection(config.CurrentBeaconsCollection);
const currentScannerCollection = myDB.collection(config.CurrentScannersCollection);

const currentBeaconsArray = config.beacons.map(beacon => {
  return { ...beacon, location: "-" }
})

const currentScannersArray = config.scanners.map(scanner => {
  return { ...scanner, lastUpdate: new Date() }
})

async function updateDB() {
  try {
    await ConfigCollection.updateOne({}, {$set: config}, { upsert: true });
    await currentBeaconCollection.updateOne({}, {$set: {beacons: currentBeaconsArray}}, { upsert: true });
    await currentScannerCollection.updateOne({}, {$set: {scanners: currentScannersArray}}, { upsert: true });
    
  } catch(error) {
    console.log(error)
  }
  
  process.exit();
}

updateDB();