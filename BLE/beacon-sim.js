const { update } = require("./update");
const { checkDB } = require("./update-config")
const fs = require("fs");



checkDB(1000)

module.exports = {
  checkDB
}


function randomDelay(length) {
  return Math.floor(Math.random() * length);
}

function BeaconSim(length) {
  

  let intervalID = setInterval(() => {
    const config = JSON.parse(fs.readFileSync('./config.json'));
    let beaconData = config.beacons;
    let scannerData = config.scanners;
    let beaconIndex = randomDelay(beaconData.length);
    let scannerIndex = randomDelay(scannerData.length);
    update(beaconData[beaconIndex], new Date(), scannerData[scannerIndex].location);
    console.log(`${beaconData[beaconIndex].name} #${beaconData[beaconIndex].ID} arrived at ${scannerData[scannerIndex].location}`);
  }, 2000)

  setTimeout(() => {
    clearInterval(intervalID)
    console.log("Simulation stopped");
  }, length)

}

BeaconSim(100000);





