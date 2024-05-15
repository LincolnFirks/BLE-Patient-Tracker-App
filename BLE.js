const BeaconScanner = require('node-beacon-scanner');
const { update, client } = require("./update");
const { parse } = require('path');

const scanner = new BeaconScanner();


const beacon1 = {
  identifiers: {
    uuid: '6B9FFDFF-5A95-4379-9833-08A0FD76D615',
    major: 100,
    minor: 6
  },
  status: false,
  distanceReadings: []
}


// Handle beacon advertisements
scanner.onadvertisement = (ad) => {
  HandleAd(ad);
};

function HandleAd(ad) {
  exponent = (ad.iBeacon.txPower - ad.rssi) / (10 * 2);
  distance = Math.pow(10, exponent) * 3.28; // convert to feet
  distance = parseFloat(distance.toFixed(1)); // round
  const now = new Date();
  let device = { // these are the values we care about
    identifiers: {
      uuid: ad.iBeacon.uuid,
      major: ad.iBeacon.major,
      minor: ad.iBeacon.minor,
    },
    distance: distance,
    time: now,
  }
  HandleUpdate(device);
  
};

function HandleUpdate(device) {
  if (device.identifiers.uuid === beacon1.identifiers.uuid &&
    device.identifiers.major === beacon1.identifiers.major &&
    device.identifiers.minor === beacon1.identifiers.minor) {
    beacon1.distanceReadings.push(device.distance);
    if (beacon1.distanceReadings.length < 5) {
      return;
    }
    console.log(average(beacon1.distanceReadings))
    console.log((beacon1.distanceReadings))
    if ((average(beacon1.distanceReadings) < 20) && (beacon1.status == false)) {
      update("PracticeDB","beacon1", true, device.time);
      beacon1.status = true;
    } else if ((average(beacon1.distanceReadings) >= 20) && (beacon1.status == true)) {
      update("PracticeDB","beacon1", false, device.time);
      beacon1.status = false;
    } 
    beacon1.distanceReadings = [];
  }
}

 
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


function average(array) {
  let sum = 0;
  array.forEach((num) => {
    sum += num;
  });
  return parseFloat((sum / array.length).toFixed(1));
}


// setTimeout(() => { // Stop scanning after 3 seconds (for testing)
//   scanner.stopScan();
//   console.log("stopped scanning.");
//   process.exit();
// }, 15000);




// Example beacon for reference
// {
//   "id": "40b4d11898279091563f54815a7f8704",
//   "address": "",
//   "localName": "iPhone (3)",
//   "txPowerLevel": null,
//   "rssi": -37,
//   "beaconType": "iBeacon",
//   "iBeacon": {
//     "uuid": "6B9FFDFF-5A95-4379-9833-08A0FD76D615",
//     "major": 100,
//     "minor": 6,
//     "txPower": -59
//   }