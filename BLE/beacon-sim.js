const { update } = require("./update");
const { CheckConfig } = require("./update-config")
const fs = require("fs");
require('dotenv').config();

const SIM_LENGTH = 60 // simulation length in seconds
const SIM_INTERVAL = 3 // interval of updates in sim (seconds)

function BeaconSim(length) {

  let intervalID = setInterval(() => {
    const config = JSON.parse(fs.readFileSync('./config.json'));
    let beaconData = config.beacons;
    let scannerData = config.scanners;
    let beaconIndex = randomIndex(beaconData.length);
    let scannerIndex = randomIndex(scannerData.length);
    update(beaconData[beaconIndex], new Date(), scannerData[scannerIndex].location, config);
    console.log(`${beaconData[beaconIndex].tag} arrived at ${scannerData[scannerIndex].location}`);
  }, SIM_INTERVAL*1000)

  setTimeout(() => {
    clearInterval(intervalID)
    console.log("Simulation stopped");
  }, length)
}

BeaconSim(SIM_LENGTH*1000);
CheckConfig(process.env.CONFIG_INTERVAL*1000)


function randomIndex(length) {
  return Math.floor(Math.random() * length);
}





