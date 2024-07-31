const BeaconScanner = require('node-beacon-scanner');
const scanner = new BeaconScanner();
const { update } = require("./update");
const { checkDB } = require("./update-config");
const fs = require("fs");
const { match } = require('assert');
const getMAC = require("getmac").default;
require('dotenv').config();
const distanceReadings = {};




// Handle beacon advertisements
scanner.onadvertisement = (ad) => {
  HandleAd(ad, new Date());
};

// initial ad handling
async function HandleAd(ad, time) {
  const config = JSON.parse(fs.readFileSync('./config.json')); // get updated config
  
  let beaconData = config.beacons;
  let beaconUUIDs = new Set(beaconData.map(beacon => beacon.uuid)); // create set of all IDs.

  beaconData.forEach(beacon => { 
    if (!distanceReadings[beacon.uuid]) {
      distanceReadings[beacon.uuid] = [];
    }  // if no distance readings for that beacon yet, create one
  })
  Object.keys(distanceReadings).forEach(key => {
    if (!beaconUUIDs.has(key)) {
      delete distanceReadings[key];
    } // if beacons was deleted, delete the distanceReadings for it.
  })

  const matchingBeacon = beaconData.find(beacon => beacon.uuid === (ad.iBeacon.uuid).toLowerCase());
  // find matching beacon in config (filters out other BLE signals)
  
  if (matchingBeacon) {
    let exponent = (ad.iBeacon.txPower - ad.rssi) / (10 * process.env.ENV_FACTOR); // exponent in distance calculation
    let distance = Math.pow(10, exponent) * 3.28; // calculate formula and convert to feet (3.28)
    distance = parseFloat(distance.toFixed(1)); // round - this is est. feet from beacon
    HandleUpdate(matchingBeacon, distance, time, config) // send to Handle update
  }
  // HandleUpdate(beaconData[0], distance, time, config)
};

function HandleUpdate(beacon, distance, time, config) {
  distanceReadings[beacon.uuid].push(distance); // add distance reading to array
  if (distanceReadings[beacon.uuid].length < process.env.MOVING_AVERAGE) return; //  if less than 5, keep collecting
  
  if (average(distanceReadings[beacon.uuid]) < process.env.PROXIMITY_THRESHOLD) { // if average is in range(feet)
    console.log(average(distanceReadings[beacon.uuid]));
    const scanners = config.scanners;
    const matchingScanner = scanners.find(scanner => scanner.address === getMAC());
    // match mac address of this device to scanners in config
    if (matchingScanner) {
      if (beacon.location === scanner.location) return; // if beacon is already there, stop
      update(beacon, time, matchingScanner.location); // offload to update
    }
  } 
  distanceReadings[beacon.ID] = []; //  reset array after it gets to length of 5
}

function initiateScan() {
  const config = JSON.parse(fs.readFileSync('./config.json')); // get current config
  config.beacons.forEach(beacon => { // set up initial distanceReadings
    distanceReadings[beacon.ID] = [];
  })

  scanner.startScan().then(() => {
    console.log('Started to scan.')  ;
  }).catch((error) => {
    console.error(error);
  });
}

initiateScan();
checkDB(process.env.CONFIG_INTERVAL*1000); // check for config updates on interval (milliseconds)


// take average of array of nums (used for the distance calculations.)
function average(array) {
  let sum = 0;
  array.forEach((num) => {
    sum += num;
  });
  return parseFloat((sum / array.length).toFixed(1));
}

