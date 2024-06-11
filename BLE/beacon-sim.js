const { update } = require("./update");
const { UpdateLocal } = require("./listen");
const fs = require("fs");



async function BeaconSim(length) {
  
  await UpdateLocal();

  let intervalID = setInterval(() => {
    let beaconData = JSON.parse(fs.readFileSync("beacons.json", "utf-8"));
    let scannerData = JSON.parse(fs.readFileSync("scanners.json", "utf-8"));
    let beaconIndex = randomIndex(beaconData.beacons.length);
    let scannerIndex = randomIndex(scannerData.scanners.length);
    update(beaconData.beacons[beaconIndex], new Date(), scannerData.scanners[scannerIndex].location);
    console.log(`${beaconData.beacons[beaconIndex].ID} arrived at ${scannerData.scanners[scannerIndex].location}`);
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





