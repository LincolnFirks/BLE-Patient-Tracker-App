const { update , client } = require("./update");
const { AddBeacon, RemoveBeacon, startup } = require("./modify-beacons")
const fs = require("fs");
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
let config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
let beaconData = JSON.parse(fs.readFileSync("beacons.json", "utf-8"));
let scannerData = JSON.parse(fs.readFileSync("scanners.json", "utf-8"));




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

checkDB(1000)


function randomDelay(length) {
  return Math.floor(Math.random() * length);
}

function BeaconSim(length) {

  let intervalID = setInterval(() => {
    let beaconIndex = randomDelay(beaconData.beacons.length);
    let scannerIndex = randomDelay(scannerData.scanners.length);
    update(beaconData.beacons[beaconIndex], new Date(), scannerData.scanners[scannerIndex].location);
    console.log(`${beaconData.beacons[beaconIndex].ID} arrived at ${scannerData.scanners[scannerIndex].location}`);
  }, 2000)

  setTimeout(() => {
    clearInterval(intervalID)
    console.log("Simulation stopped");
  }, length)

}

BeaconSim(100000);





