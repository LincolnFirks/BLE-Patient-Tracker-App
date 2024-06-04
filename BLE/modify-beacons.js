

async function AddBeacon(ID, address, beaconData, client, config) {
  const fs = require("fs");
  newBeacon = {
    ID,
    name: "-", // placeholder
    address,
    "distanceReadings": []
  }
  beaconData.beacons.push(newBeacon)
  fs.writeFileSync("beacons.json",JSON.stringify(beaconData), "utf-8");
  let currentBeacons = (JSON.parse(fs.readFileSync("current-beacons.json", "utf-8")));
  currentBeacons.beacons.push(ID);
  fs.writeFileSync("current-beacons.json",JSON.stringify(currentBeacons), "utf-8");

  await client.connect();
  const myDB = client.db(config.database);
  const currentBeaconsColl = myDB.collection(config.CurrentBeaconsCollection);
  const result = await currentBeaconsColl.updateOne({}, {$push: {beacons: ID}}, { upsert: true });
}

async function RemoveBeacon(ID, beaconData, client, config) {
  const fs = require("fs");
  beaconData.beacons = beaconData.beacons.filter(beacon => beacon.ID !== ID);
  fs.writeFileSync("beacons.json",JSON.stringify(beaconData), "utf-8");
  let currentBeacons = (JSON.parse(fs.readFileSync("current-beacons.json", "utf-8")));
  currentBeacons.beacons = currentBeacons.beacons.filter(beaconID => beaconID !== ID);
  fs.writeFileSync("current-beacons.json",JSON.stringify(currentBeacons), "utf-8");
  await client.connect();
  const myDB = client.db(config.database);
  const currentBeaconsColl = myDB.collection(config.CurrentBeaconsCollection);
  const result = await currentBeaconsColl.updateOne({}, {$pull: {beacons: ID}}, { upsert: false });
}

async function startup(client, config, currentBeacons) {
  await client.connect();
  const myDB = client.db(config.database);
  const currentBeaconsColl = myDB.collection(config.CurrentBeaconsCollection);
  await currentBeaconsColl.updateOne({}, {$set: {beacons: currentBeacons}}, { upsert: true });
  const result = await currentBeaconsColl.find({}).toArray()
  console.log(result);
}

module.exports = {
  AddBeacon,
  RemoveBeacon,
  startup
}