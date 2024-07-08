import { Meteor } from 'meteor/meteor';
import {
  currentBeaconCollection, 
  ConfigCollection, ScannerCollection
} from '/imports/api/Collections';
import { WebApp } from 'meteor/webapp'
import bodyParser from 'body-parser';
import axios from 'axios';


Meteor.publish('data', () => {
  return [ currentBeaconCollection.find(),
     ConfigCollection.find(), ScannerCollection.find()];
});

WebApp.connectHandlers.use(bodyParser.json());

WebApp.connectHandlers.use('/register-endpoint', (req, res) => { // from API
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

WebApp.connectHandlers.use('/register-tag', (req, res) => { // from API
  if (req.method === 'POST') {
    const postData = req.body;
    if (!postData.tag || !postData.uuid) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({error: "Incorrect fields entered"}));
    } else {
      try {
        const newEntry = {tag: postData.tag, uuid: postData.uuid, location: "-", lastUpdate: "-"}
        currentBeaconCollection.updateAsync(
          {}, { $push: {beacons: newEntry} }
        )
        ConfigCollection.updateAsync(
          {}, { $push: {beacons: newEntry}}
        )
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({message: "App recieved endpoint successfully"}));
      } catch(err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({error: "Couldn't register tag/uuid in app configuration"}));
      }
    }
  }
})


WebApp.connectHandlers.use('/config-update', async (req, res, next) => { // From Scanners
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

WebApp.connectHandlers.use('/entry', async (req, res, next) => { // From Scanners
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

    currentBeaconCollection.updateAsync(
      { "beacons.ID": entry.beaconID },
      { $set: { "beacons.$.location": entry.location, "beacons.$.lastUpdate": new Date(entry.time)  } }
    ); // update current beacons with location

  

    const config = await findOneAsync({});
    if (config.EHRendpoint && config.EHRendpoint !== "-") {
      try {
        axios.post(config.EHRendpoint, entry); // send location update to EHR. Endpoint is given
      } catch (error) {
        console.log("Error posting to EHR", error)
      }
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
        beacons: config.beacons.map(beacon => ({...beacon, location: "-", lastUpdate: "-" }))
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
      { $pull: { beacons: { uuid: removeID } } }
    );
    ConfigCollection.updateAsync(
      {},
      { $pull: { beacons: { uuid: removeID } } }
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