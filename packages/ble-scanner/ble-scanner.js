const BeaconScanner = require('node-beacon-scanner');
const { parse } = require('path');

const scanner = new BeaconScanner();


const beacon1 = {
  identifiers: {
    uuid: '6B9FFDFF-5A95-4379-9833-08A0FD76D615',
    major: 100,
    minor: 6
  },
  status: false,
  distanceReadings: [] // collection of last 5 readings
}

// Handle beacon advertisements
scanner.onadvertisement = (ad) => {
  HandleAd(ad);
};

function HandleAd(ad) {
  exponent = (ad.iBeacon.txPower - ad.rssi) / (10 * 2);
  distance = Math.pow(10, exponent) * 3.28; // convert to feet
  distance = parseFloat(distance.toFixed(1)); // this is est. feet from beacon
  const now = new Date(); // fetch current exact date/time
  let device = { 
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
  // identify which beacon the signal is from
  if (device.identifiers.uuid === beacon1.identifiers.uuid &&
    device.identifiers.major === beacon1.identifiers.major &&
    device.identifiers.minor === beacon1.identifiers.minor) {
    beacon1.distanceReadings.push(device.distance); // add distance reading to array
    if (beacon1.distanceReadings.length < 5) {
      return; //  if less than 5, keep collecting
    } // otherwise:
    console.log(average(beacon1.distanceReadings))
    console.log((beacon1.distanceReadings))
    if ((average(beacon1.distanceReadings) < 20) && (beacon1.status == false)) {
      update("PracticeDB","beacon1", true, device.time);
      beacon1.status = true;
      // if within 20 feet and current location is outside, send update and change status
    } else if ((average(beacon1.distanceReadings) >= 20) && (beacon1.status == true)) {
      update("PracticeDB","beacon1", false, device.time);
      beacon1.status = false;
    } // if outside 20 feet and current location is inside, send update and change status
    beacon1.distanceReadings = [];
  }
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

