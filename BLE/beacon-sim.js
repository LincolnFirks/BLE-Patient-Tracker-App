const { update , client } = require("./update");
const { AddBeacon, RemoveBeacon, startup } = require("./modify-beacons")
const fs = require("fs");
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
let config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
let beaconData = JSON.parse(fs.readFileSync("beacons.json", "utf-8"));
let scannerData = JSON.parse(fs.readFileSync("scanners.json", "utf-8"));
let currentBeacons = (JSON.parse(fs.readFileSync("current-beacons.json", "utf-8"))).beacons;

startup(client, config, currentBeacons);


const app = express();
const PORT = 3002;

app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to handle POST requests to /name-change
app.post('/name-change', (req, res) => {
  console.log('Received data:', req.body);
  let oldName = req.body.oldName;
  let newName = req.body.newName;
  changeID(oldName, newName)
  res.send('Data received successfully');
});
// Route to handle POST requests to /new-beacon
app.post('/new-beacon', (req, res) => {
  console.log('Received data:', req.body);
  let ID = req.body.ID;
  let Address = req.body.Address;
  AddBeacon(ID, Address, beaconData, client, config)
  res.send('Data received successfully');
});

app.post('/remove-beacon', (req, res) => {
  console.log('Received data:', req.body);
  let ID = req.body.ID;
  RemoveBeacon(ID, beaconData, client, config);
  res.send('Data received successfully');
});
// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});



function randomDelay() {
  return Math.floor(Math.random() * 50000);
}

function changeID(oldName, newName) {
  beaconData.beacons.forEach(beacon => {
    if (beacon.name === oldName) {
      beacon.name = newName;
      return;
    }});
    fs.writeFileSync("beacons.json",JSON.stringify(beaconData), "utf-8");
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


