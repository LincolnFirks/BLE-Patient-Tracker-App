const { update, client } = require("./update");
const fs = require("fs");

let beaconData = JSON.parse(fs.readFileSync("beacons.json", "utf-8"));
let scannerData = JSON.parse(fs.readFileSync("scanners.json", "utf-8"));

function randomDelay() {
  return Math.floor(Math.random() * 50000);
}

// Loop with random delays
beaconData.beacons.forEach(beacon => {
  scannerData.scanners.forEach(scanner => {
    setTimeout(() => {
      update(beacon, new Date(), scanner.location);
      console.log(`${beacon.ID} arrived at ${scanner.location}`)
    }, randomDelay());
  });
});
