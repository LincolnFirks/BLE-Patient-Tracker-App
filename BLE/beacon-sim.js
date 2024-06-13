const { update } = require("./update");
<<<<<<< HEAD
const { UpdateLocal } = require("./listen");
=======
const { checkDB } = require("./update-config")
>>>>>>> test-interval-updates
const fs = require("fs");



<<<<<<< HEAD
async function BeaconSim(length) {
=======
checkDB(1000)

module.exports = {
  checkDB
}


function randomDelay(length) {
  return Math.floor(Math.random() * length);
}

function BeaconSim(length) {
>>>>>>> test-interval-updates
  
  await UpdateLocal();

  let intervalID = setInterval(() => {
<<<<<<< HEAD
    let beaconData = JSON.parse(fs.readFileSync("beacons.json", "utf-8"));
    let scannerData = JSON.parse(fs.readFileSync("scanners.json", "utf-8"));
    let beaconIndex = randomIndex(beaconData.beacons.length);
    let scannerIndex = randomIndex(scannerData.scanners.length);
    update(beaconData.beacons[beaconIndex], new Date(), scannerData.scanners[scannerIndex].location);
    console.log(`${beaconData.beacons[beaconIndex].ID} arrived at ${scannerData.scanners[scannerIndex].location}`);
=======
    const config = JSON.parse(fs.readFileSync('./config.json'));
    let beaconData = config.beacons;
    let scannerData = config.scanners;
    let beaconIndex = randomDelay(beaconData.length);
    let scannerIndex = randomDelay(scannerData.length);
    update(beaconData[beaconIndex], new Date(), scannerData[scannerIndex].location);
    console.log(`${beaconData[beaconIndex].name} #${beaconData[beaconIndex].ID} arrived at ${scannerData[scannerIndex].location}`);
>>>>>>> test-interval-updates
  }, 2000)

  setTimeout(() => {
    clearInterval(intervalID)
    console.log("Simulation stopped");
  }, length)

}

BeaconSim(100000);


function randomIndex(length) {
  return Math.floor(Math.random() * length);
}





