const { update } = require("./update");
const { checkDB } = require("./modify-beacons")
const fs = require("fs");
let config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
let beaconData = JSON.parse(fs.readFileSync("beacons.json", "utf-8"));
let scannerData = JSON.parse(fs.readFileSync("scanners.json", "utf-8"));






checkDB(1000)

module.exports = {
  checkDB
}


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





