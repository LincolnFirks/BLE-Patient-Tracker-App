## BLE Scanning 

To get a device set up, navigate to this directory (BLE) and run:

```bash
npm install
```

Before you start sending updates to the application, you need to edit the config.json file, which will have these fields:

```JSON
{
  "ConfigCollection": "Config",
  "CurrentBeaconsCollection": "CurrentBeacons",
  "CurrentScannersCollection": "CurrentScanners",
  "EHRendpoint": "-",
  "beacons": [],
  "scanners": [],
  "appURL": "http://localhost:3000/"
}
```

The Web Application will be set up to work with these Collection names. 
You will need to change the "appURL" field to where you are running the web app.
By default, Meteor runs on port 3000. See the Meteor app documentation (app-backend) to see how to change this.


Once you have set config.json to your specifications, run this while the web app is running to initialize the database.
```bash
node initialize-database.js
```

To start scanning for devices, run:

```bash
node BLE.js
```


If you want to run a simulation that sends random updates to the app with the current beacons and scanners, you can run the following commands:
```bash

node beacon-sim.js
```
