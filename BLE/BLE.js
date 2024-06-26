const BeaconScanner = require('@ansgomez/node-beacon-scanner');
const { update } = require("./update");
const { checkDB } = require("./update-config");
const fs = require("fs");
const getMAC = require("getmac").default;
const distanceReadings = {};


const scanner = new BeaconScanner();

// Handle beacon advertisements
scanner.onadvertisement = (ad) => {
  HandleAd(ad, new Date());
};

// initial ad handling
async function HandleAd(ad, time) {
  const config = JSON.parse(fs.readFileSync('./config.json')); // get updated config
  
  let beaconData = config.beacons;
  let beaconIDs = new Set(beaconData.map(beacon => beacon.ID)); // create set of all IDs.

  beaconData.forEach(beacon => { 
    if (!distanceReadings[beacon.ID]) {
      distanceReadings[beacon.ID] = [];
    }  // if no distance readings for that beacon yet, create one
  })
  Object.keys(distanceReadings).forEach(key => {
    if (!beaconIDs.has(key)) {
      delete distanceReadings[key];
    } // if beacons was deleted, delete the distanceReadings for it.
  })

  const matchingBeacon = beaconData.find(beacon => beacon.address === ad.address);
  // find matching beacon in config (filters out other BLE signals)

  if (matchingBeacon) {
    let exponent = (ad.iBeacon.txPower - ad.rssi) / (10 * 2); // exponent in distance calculation
    let distance = Math.pow(10, exponent) * 3.28; // calculate formula and convert to feet (3.28)
    distance = parseFloat(distance.toFixed(1)); // round - this is est. feet from beacon
    HandleUpdate(matchingBeacon, distance, time) // send to Handle update
  }
  // HandleUpdate(beaconData[0], distance, time, config)
};

function HandleUpdate(beacon, distance, time, config) {
  distanceReadings[beacon.ID].push(distance); // add distance reading to array
  if (distanceReadings[beacon.ID].length < 15) return; //  if less than 5, keep collecting
  
  if (average(distanceReadings[beacon.ID]) < 30) { // if average is in range(feet)
    const scanners = config.scanners;
    const matchingScanner = scanners.find(scanner => scanner.address === getMAC());
    // match mac address of this device to scanners in config
    if (matchingScanner) {
      update(beacon, time, matchingScanner.location, config); // offload to update
    }
  } 
  distanceReadings[beacon.ID] = []; //  reset array after it gets to length of 5
}

async function initiateScan() {
  const config = JSON.parse(fs.readFileSync('./config.json')); // get current config
  config.beacons.forEach(beacon => { // set up initial distanceReadings
    distanceReadings[beacon.ID] = [];
  })

  scanner.startScan().then(() => {
    console.log('Started scanning...');
  }).catch((error) => {
    console.log(error);
  });
}

initiateScan();
checkDB(1000); // check for config updates on interval (milliseconds)


// take average of array of nums (used for the distance calculations.)
function average(array) {
  let sum = 0;
  array.forEach((num) => {
    sum += num;
  });
  return parseFloat((sum / array.length).toFixed(1));
}

