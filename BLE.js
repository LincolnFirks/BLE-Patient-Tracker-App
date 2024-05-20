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
  distanceReadings: [], // collection of last 5 readings
  collection: "beacon1"
}

const beacon2 = {
  identifiers: {
    uuid: '6B9FFDFF-5A95-4379-9833-08A0FD76D616',
    major: 100,
    minor: 6
  },
  status: false,
  distanceReadings: [], // collection of last 5 readings
  collection: "beacon2"
}

const beacon3 = {
  identifiers: {
    uuid: '6B9FFDFF-5A95-4379-9833-08A0FD76D617',
    major: 100,
    minor: 6
  },
  status: false,
  distanceReadings: [], // collection of last 5 readings
  collection: "beacon3"
}

const beacon4 = {
  identifiers: {
    uuid: '6B9FFDFF-5A95-4379-9833-08A0FD76D618',
    major: 100,
    minor: 6
  },
  status: false,
  distanceReadings: [], // collection of last 5 readings
  collection: "beacon4"
}

const beacon5 = {
  identifiers: {
    uuid: '6B9FFDFF-5A95-4379-9833-08A0FD76D619',
    major: 100,
    minor: 6
  },
  status: false,
  distanceReadings: [], // collection of last 5 readings
  collection: "beacon5"
}

const beacon6 = {
  identifiers: {
    uuid: '6B9FFDFF-5A95-4379-9833-08A0FD76D610',
    major: 100,
    minor: 6
  },
  status: false,
  distanceReadings: [], // collection of last 5 readings
  collection: "beacon6"
}

// Handle beacon advertisements
scanner.onadvertisement = (ad) => {
  HandleAd(ad);
};

function HandleAd(ad) {
  exponent = (ad.iBeacon.txPower - ad.rssi) / (10 * 2);
  distance = Math.pow(10, exponent) * 3.28; // convert to feet
  distance = parseFloat(distance.toFixed(1)); // this is est. feet from beacon
  let now = new Date(); // fetch current exact date/time
  const formattedDate = now.toLocaleDateString('en-US');
  const formattedTime = now.toLocaleTimeString('en-US');
  now = formattedDate + " " + formattedTime;
  let device = { 
    identifiers: { 
      uuid: ad.iBeacon.uuid,
      major: ad.iBeacon.major,
      minor: ad.iBeacon.minor,
    },
    distance: distance,
    time: now,
  }
  
  if (device.identifiers.uuid === beacon1.identifiers.uuid) HandleUpdate(device, beacon1);
  if (device.identifiers.uuid === beacon2.identifiers.uuid) HandleUpdate(device, beacon2);
  if (device.identifiers.uuid === beacon3.identifiers.uuid) HandleUpdate(device, beacon3);
  if (device.identifiers.uuid === beacon4.identifiers.uuid) HandleUpdate(device, beacon4);
  if (device.identifiers.uuid === beacon5.identifiers.uuid) HandleUpdate(device, beacon5);
  if (device.identifiers.uuid === beacon6.identifiers.uuid) HandleUpdate(device, beacon6);
  
};

function HandleUpdate(device, beacon) {
  beacon.distanceReadings.push(device.distance); // add distance reading to array
  if (beacon.distanceReadings.length < 5) {
    return; //  if less than 5, keep collecting
  } // otherwise:
  console.log(average(beacon.distanceReadings))
  console.log((beacon.distanceReadings))
  if ((average(beacon.distanceReadings) < 20) && (beacon.status == false)) {
    update("meteor",beacon.collection, true, device.time);
    beacon.status = true;
    // if within 20 feet and current location is outside, send update and change status
  } else if ((average(beacon.distanceReadings) >= 20) && (beacon.status == true)) {
    update("meteor", beacon.collection, false, device.time);
    beacon.status = false;
  } // if outside 20 feet and current location is inside, send update and change status
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

