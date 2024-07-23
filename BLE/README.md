# BLE Scanning 

## Set up

To get a device set up, navigate to this directory (BLE) and run:

```bash
npm install
```

Before you start sending updates to the application, you need to set an environmental variable for the url you are running the web application on.

Create a .env file in the BLE directory and add the following variables.

```plaintext
APP_URL=http://localhost:3000/
ENV_FACTOR=2
MOVING_AVERAGE=5
PROXIMITY_THRESHOLD=30 

```

APP_URL with whichever port you are running the web application on.

ENV_FACTOR is used in the distance calculation. It ranges from 2-4. 2 would be a room with no signal interference, 4 being the most interference.
To get this number th emost accurate, manual testing would need to be done in each room.
If interested in reading more about RSSI to distance calculations, check out [Evaluation of the reliability of RSSI for Indoor Localization](https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=65228221cfa4fa93654b2b24aa7b41f4d04c82d0)

MOVING_AVERAGE is the number of singals from a beacon the scanner will take before reporting its average calculated distance from those signals. 

PROXIMITY_THRESHOLD is the distance a token/patient needs to be inside in order for the scanner the report the location. 
This will likely need to be changed for each room/scanner. This is measured in feet.


Before any scanning is done, run the following command once while the web app is running to initialize the database.
```bash
node initialize-database.js
```

## Usage

To start scanning for devices, run:

```bash
node BLE.js
```


If you want to run a simulation that sends random updates to the app with the current beacons and scanners, you can run:
```bash

node beacon-sim.js
```
