import { Meteor } from 'meteor/meteor';
import {
  beaconLocationCollection, beaconNameCollection,
  currentBeaconCollection, ConfigCollection, ScannerCollection
} from '/imports/api/Collections';
import { WebApp } from 'meteor/webapp'
import bodyParser from 'body-parser';


Meteor.publish('data', () => {
  return [beaconLocationCollection.find(), beaconNameCollection.find(),
  currentBeaconCollection.find(), ConfigCollection.find(), ScannerCollection.find()];
});

WebApp.connectHandlers.use(bodyParser.json());

WebApp.connectHandlers.use('/register-endpoint', (req, res) => {
  if (req.method === 'POST') {
    if (!req.body.endpoint) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({error: "Endpoint is required"}));
    } else {
      try {
        const endpoint = req.body.endpoint;
        ConfigCollection.updateAsync(
          {}, { $set: {EHRendpoint: endpoint}}
        )
        console.log("Successfully registered endpoint")
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({message: "App recieved endpoint successfully"}));
      } catch(error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({error: "Couldn't register endpoint in app configuration"}));
      }
    }
  }
})


WebApp.connectHandlers.use('/config-update', async (req, res, next) => {
  if (req.method === 'POST') {

    try {
      const config = await ConfigCollection.findOneAsync();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(config));
    } catch(error) {
      console.error(error);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
    
    ScannerCollection.updateAsync(
      { 'scanners.address': req.body.address },
      { $set: { 'scanners.$.lastUpdate': new Date() } }
    )
    
  }
}); // recieve notifcation from device that config was updated.

WebApp.connectHandlers.use('/entry', async (req, res, next) => {
  if (req.method === 'POST') {
    const entry = req.body;

    const lastLocation = await currentBeaconCollection.findOneAsync();

    let duplicate = false;

    if (lastLocation) {
      duplicate = lastLocation.beacons.find(beacon => beacon.location === entry.location && 
        beacon.ID === entry.beaconID);
    }

    if (duplicate) {
      console.log("duplicate entry");
      return;
    } //  if location is same as last one, don't make entry.

    beaconLocationCollection.insertAsync({ ...entry, time: new Date(entry.time)});

    currentBeaconCollection.updateAsync(
      { "beacons.ID": entry.beaconID },
      { $set: { "beacons.$.location": entry.location } }
    ); // update current beacons with location

    const checkPatient = await beaconNameCollection.findOneAsync({"patient.ID": entry.patient.ID});
    if (!checkPatient) {
      beaconNameCollection.insertAsync({ patient: entry.patient, time: new Date(entry.time)});
      console.log("New name entered")
    } else {
      beaconNameCollection.updateAsync({_id: checkPatient._id}, {$set: {time: new Date(entry.time)}})
      console.log("Name updated")
    }

  }
}); 

WebApp.connectHandlers.use('/initialize', async (req, res, next) => {
  if (req.method === 'POST') {
    try {
      const config = req.body;
      await ConfigCollection.removeAsync({});
      ConfigCollection.insertAsync(config);
      await currentBeaconCollection.removeAsync({});
      currentBeaconCollection.insertAsync({
        beacons: config.beacons.map(beacon => ({...beacon, location: "-" }))
      });
      await ScannerCollection.removeAsync({});
      ScannerCollection.insertAsync({
        scanners: config.scanners.map(scanner => ({...scanner, lastUpdate: new Date() }))
      });
      console.log("Database successfully initialized.")
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end("Database successfully initialized.");
    } catch(error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end("Error initializing database, see server for details.");
    }
    
  }
}); // recieve notifcation from device that config was updated.

Meteor.methods({

  async 'PostBeaconName'(ID, newName, newID) { // change name in database
    let result = await currentBeaconCollection.findOneAsync(
      { $or: [
        {"beacons.patient.name": newName },
        { "beacons.patient.ID": newID}
      ]}
    );
    
    if (result && newName !== "-") {
      return true;
    }

    result = await beaconNameCollection.findOneAsync({ "patient.ID": newID })
    
    if ((result) && (result.patient.name !== newName) && (newID !== "-")) {
      return true;
    }

    const timestamp = new Date();

    const newPatient = {
      name: newName,
      ID: newID
    };

    currentBeaconCollection.updateAsync(
      { 'beacons.ID': ID },
      { $set: { 'beacons.$.patient': newPatient } }
    ); // change name in CurrentBeacons

    ConfigCollection.updateAsync(
      { 'beacons.ID': ID },
      { $set: { 'beacons.$.patient': newPatient } }
    ); // change name in Config

    if (newName !== "-") {
        // make entry at current location for new name
      beaconLocationCollection.findOneAsync( 
        { beaconID: ID }, { sort: { time: -1 } }
        // get most recent entry with this beacon
      ).then(doc => {
        if (doc) {
          beaconLocationCollection.insertAsync({
            beaconID: ID,
            patient: newPatient,
            address: doc.address,
            location: doc.location,
            time: timestamp
          })
        } // make location entry with that location
      });

      beaconNameCollection.updateAsync(
        {"patient.ID": newID, "patient.name": newName },
        { $set: { time: timestamp } },
        { upsert: true }
      ) // update Name collection if new name or just timestamp
    }

  
  },

  async 'PostScannerLocation'(address, newLocation) { // change name in database

    let result = await ScannerCollection.findOneAsync(
      { "scanners.location": newLocation }
    );
    
    if (result && newLocation !== "-") {
      return true;
    }


    ScannerCollection.updateAsync(
      { 'scanners.address': address },
      { $set: { 'scanners.$.location': newLocation } }
    ); // change name in CurrentScanners

    ConfigCollection.updateAsync(
      { 'scanners.address': address },
      { $set: { 'scanners.$.location': newLocation } }
    ); // change name in Config

  },

  async 'AddBeacon'(ID, address) {
    let result = await currentBeaconCollection.findOneAsync(
      { $or: [
        { "beacons.address": address },
        { "beacons.ID": ID }
      ]}
    )
    
    if (result) {
      return true;
    }

  
    const newBeacon = {
      ID,
      patient: {
        name: "-",
        ID: "-"
      },
      address,
      location: "-"
    } // entry for currentBeacons
    const newBeaconConfig = {
      ID,
      patient: {
        name: "-",
        ID: "-"
      },
      address
    } // entry for Config
    currentBeaconCollection.updateAsync(
      {},
      { $push: { beacons: newBeacon } }
    );

    ConfigCollection.updateAsync(
      {},
      { $push: { beacons: newBeaconConfig } })
  },

  async 'AddScanner'(location, address) {

    let result = await ScannerCollection.findOneAsync(
      { $or: [
        { "scanners.address": address },
        { "scanners.location": location }
      ]}
    )
    
    if (result) {
      return true;
    }

    const newScanner = {
      location,
      address,
      lastUpdate: new Date()
    }
    const newScannerConfig = {
      location,
      address
    }
    ScannerCollection.updateAsync(
      {},
      { $push: { scanners: newScanner}}
    );
    ConfigCollection.updateAsync(
      {},
      { $push: {scanners: newScannerConfig}}
    )
  },

  'RemoveBeacon'(removeID) {
    currentBeaconCollection.updateAsync(
      {},
      { $pull: { beacons: { ID: removeID } } }
    );
    ConfigCollection.updateAsync(
      {},
      { $pull: { beacons: { ID: removeID } } }
    );
  },

  'RemoveScanner'(address) {
    ScannerCollection.updateAsync(
      {},
      { $pull: {scanners: {address: address}}}
    );
    ConfigCollection.updateAsync(
      {},
      { $pull: {scanners: {address: address}}}
    )
  },

  'IsMAC'(address) {
    if (address.length !== 17) return false;

    for (let i = 0; i < address.length; i++) {
      if ((i+1) % 3 === 0) {
        if (address[i] !== ":") {
          return false;
        }
      } else if (isNaN(address[i]) && !(/[a-z]/.test(address[i]))) {
          return false;
      }
      
    }
    return true;
      
  }
  
})