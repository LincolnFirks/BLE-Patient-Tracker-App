const BeaconScanner = require('node-beacon-scanner');
const { update, client } = require("./update");
const { parse } = require('path');
const fs = require("fs");
const getMAC = require("getmac").default;

let beaconData = JSON.parse(fs.readFileSync("beacons.json", "utf-8"));

const scanner = new BeaconScanner();

const localMac = getMAC();



// Handle beacon advertisements
scanner.onadvertisement = (ad) => {
  console.log(ad)
  HandleAd(ad, new Date());
};

function HandleAd(ad, time) {
  let exponent = (ad.iBeacon.txPower - ad.rssi) / (10 * 2);
  let distance = Math.pow(10, exponent) * 3.28; // convert to feet
  distance = parseFloat(distance.toFixed(1)); // this is est. feet from beacon

  const matchingBeacon = beaconData.beacons.find(beacon => beacon.address === ad.address);

  if (matchingBeacon) {
    HandleUpdate(matchingBeacon, distance, time)
  }
  
};

function HandleUpdate(beacon, distance, time) {
  beacon.distanceReadings.push(distance); // add distance reading to array

  if (beacon.distanceReadings.length < 5) {
    return; //  if less than 5, keep collecting
  } // otherwise:
 
  if (average(beacon.distanceReadings) < 30) {
    update(beacon, time, localMac);
    // if within 20 feet and current location is outside, send update 
  } 
  beacon.distanceReadings = [];
}
// connect to MongoDB server and start scanning for BLE advertisements.
async function initiate() {
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

initiate();

// take average of array of nums (used for the distance calculations.)
function average(array) {
  let sum = 0;
  array.forEach((num) => {
    sum += num;
  });
  return parseFloat((sum / array.length).toFixed(1));
}

