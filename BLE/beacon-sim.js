const { update } = require("./update");
const { checkDB } = require("./update-config")
const fs = require("fs");



checkDB(1000)

module.exports = {
  checkDB
}


function BeaconSim(length) {
  
  let intervalID = setInterval(() => {
    const config = JSON.parse(fs.readFileSync('./config.json'));
    let beaconData = config.beacons;
    let scannerData = config.scanners;
    let beaconIndex = randomIndex(beaconData.length);
    let scannerIndex = randomIndex(scannerData.length);
    update(beaconData[beaconIndex], new Date(), scannerData[scannerIndex].location, config);
    console.log(`${beaconData[beaconIndex].name} #${beaconData[beaconIndex].ID} arrived at ${scannerData[scannerIndex].location}`);
  }, 2000)

  setTimeout(() => {
    clearInterval(intervalID)
    console.log("Simulation stopped");
  }, length)

}

BeaconSim(1000000);


function randomIndex(length) {
  return Math.floor(Math.random() * length);
}





