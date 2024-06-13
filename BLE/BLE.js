const BeaconScanner = require('node-beacon-scanner');
const { update, client } = require("./update");
const { checkDB } = require("./modify-beacons");
const fs = require("fs");
const getMAC = require("getmac").default;
const distanceReadings = {};

const scanner = new BeaconScanner();

// Handle beacon advertisements
scanner.onadvertisement = (ad) => {
  HandleAd(ad, new Date());
};

async function HandleAd(ad, time) {
  const config = JSON.parse(fs.readFileSync('./config.json'));
  
  let beaconData = config.beacons
  let beaconIDs = new Set(beaconData.map(beacon => beacon.ID));

  beaconData.forEach(beacon => {
    if (!distanceReadings[beacon.ID]) {
      distanceReadings[beacon.ID] = [];
    } 
  })
  Object.keys(distanceReadings).forEach(key => {
    if (!beaconIDs.has(key)) {
      delete distanceReadings[key];
    }
  })

  const matchingBeacon = beaconData.find(beacon => beacon.address === ad.address);

  if (matchingBeacon) {
    let exponent = (ad.iBeacon.txPower - ad.rssi) / (10 * 2);
    let distance = Math.pow(10, exponent) * 3.28; // convert to feet
    distance = parseFloat(distance.toFixed(1)); // this is est. feet from beacon
    HandleUpdate(matchingBeacon, distance, time)
  }
  // HandleUpdate(beaconData[0], distance, time, config)
};

function HandleUpdate(beacon, distance, time, config) {
  distanceReadings[beacon.ID].push(distance); // add distance reading to array
  if (distanceReadings[beacon.ID].length < 5) return; //  if less than 5, keep collecting
  
  if (average(distanceReadings[beacon.ID]) < 30) {
    const scanners = config.scanners;
    const matchingScanner = scanners.find(scanner => scanner.address === getMAC());
    if (matchingScanner) {
      update(beacon, time, matchingScanner.location);
    }
  } 
  distanceReadings[beacon.ID] = [];
}

async function initiateScan() {
  const config = JSON.parse(fs.readFileSync('./config.json'));
  config.beacons.forEach(beacon => { // set up initial distanceReadings
    distanceReadings[beacon.ID] = [];
  })

  await client.connect();
  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
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

