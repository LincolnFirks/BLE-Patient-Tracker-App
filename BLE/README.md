## BLE Scanning 

To get a device set up, navigate to this directory (BLE) and run:

```bash
npm install
```

Before you start sending updates to the application, you need to set an environmental variable for the url you are running the web application on.

Create a .env file in the BLE directory and add the following variable.

```plaintext
APP_URL=http://localhost:3000/
```

Replace the url with whichever port you are running the web application on.
By default, Meteor runs on port 3000. See the Meteor app documentation (app-backend) to see how to change this.

Run this once while the web app is running to initialize the database.
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
