

async function AddBeacon(ID, address, beaconData, client, config) {
  const fs = require("fs");
  newBeacon = {
    ID,
    name: "-", // placeholder
    address,
    "distanceReadings": []
  }
  beaconData.beacons.push(newBeacon)
  await fs.writeFile("beacons.json",JSON.stringify(beaconData), "utf-8");
  await client.connect();
  const myDB = client.db(config.database);
  const currentBeaconsColl = myDB.collection(config.CurrentBeaconsCollection);
  const result = await currentBeaconsColl.updateOne({}, {$set: {beacons: beaconData.beacons}}, { upsert: true });
}

async function RemoveBeacon(removeID, beaconData, client, config) {
  const fs = require("fs");
  beaconData.beacons = beaconData.beacons.filter(beacon => beacon.ID !== removeID);
  await fs.writeFile("beacons.json",JSON.stringify(beaconData), "utf-8");
  await client.connect();
  const myDB = client.db(config.database);
  const currentBeaconsColl = myDB.collection(config.CurrentBeaconsCollection);
  const result = await currentBeaconsColl.updateOne({}, {$set: {beacons: beaconData.beacons}}, { upsert: false });
}

async function startup(client, config, currentBeacons) {
  await client.connect();
  const myDB = client.db(config.database);
  const currentBeaconsColl = myDB.collection(config.CurrentBeaconsCollection);
  await currentBeaconsColl.updateOne({}, {$set: {beacons: currentBeacons.beacons}}, { upsert: true });
  const result = await currentBeaconsColl.find({}).toArray()
  console.log(result);
}

module.exports = {
  AddBeacon,
  RemoveBeacon,
  startup
}