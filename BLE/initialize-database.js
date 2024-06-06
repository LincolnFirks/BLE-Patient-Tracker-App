const fs = require("fs");
const { client } = require("./update");
const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));

const myDB = client.db(config.database);
const beaconCollection = myDB.collection(config.CurrentBeaconsCollection);

const beaconArray = JSON.parse(fs.readFileSync("beacons.json", "utf-8")).beacons;

async function updateDB() {
  await beaconCollection.updateOne({}, {$set: {beacons: beaconArray}}, { upsert: true });
  process.exit();
}

updateDB();