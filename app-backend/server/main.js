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
    if (!req.body.endpoint) { // no endpoint
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({error: "Endpoint is required"}));
    } else {
      try {
        const endpoint = req.body.endpoint;
        ConfigCollection.updateAsync( // update EHR endpoint in config
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
    if (!postData.tag || !postData.uuid) { // check for uuid and tag
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({error: "Incorrect fields entered"}));
    } else {
      try {
        const newEntry = {tag: postData.tag, uuid: postData.uuid, location: "-", lastUpdate: "-"}
        currentBeaconCollection.updateAsync( // insert into  currentBeacon 
          {}, { $push: {beacons: newEntry} }
        )
        ConfigCollection.updateAsync( // update config in db with new tag
          {}, { $push: {beacons: newEntry}}
        )
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({message: "App registered tag successfully"}));
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
      const config = await ConfigCollection.findOneAsync(); // fetch config from db
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(config)); // send db config to scanner
    } catch(error) {
      console.error(error);
      res.statusCode = 500; // server error
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
    
    ScannerCollection.updateAsync( // update scanner that requested with current time in database
      { 'scanners.address': req.body.address },
      { $set: { 'scanners.$.lastUpdate': new Date() } }
    )
  
    
  }
}); // recieve notifcation from device that config was updated.

WebApp.connectHandlers.use('/entry', async (req, res, next) => { // From Scanners
  if (req.method === 'POST') {
    const entry = req.body;

    const currentBeacons = await currentBeaconCollection.findOneAsync();
    // fetch current Beacons

    let duplicate = false;

    if (currentBeacons) {
      duplicate = currentBeacons.beacons.find(beacon => beacon.location === entry.location && 
        beacon.uuid === entry.uuid);
    } // if matching beacon has same location, it hasn't moved

    if (duplicate) { 
      return;
    } // if beacon on hasn't moved, no need to update

    currentBeaconCollection.updateAsync(
      { "beacons.uuid": entry.uuid },
      { $set: { "beacons.$.location": entry.location, "beacons.$.lastUpdate": new Date(entry.time)  } }
    ); // update current beacons with new location and time

  

    const config = await ConfigCollection.findOneAsync({}); // fetch config
    if (config.EHRendpoint && config.EHRendpoint !== "-") { // if endpoint exists and isn't blank
      try {
        const response = await axios.post(config.EHRendpoint, entry); // send location update to EHR with endpoint in config
        console.log(response);
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
      // remove current database collection documents, insert new ones.
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
    ); // check for scanners already in database with same name
    
    if (result && newLocation !== "-") {
      return true;
    } // if already a scanner with that name, cancel

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
    ) // check for user inputted scanner/address in the database already
    
    if (result) {
      return true;
    } // if address/location name already in database cancel the operation

    const newScanner = {
      location,
      address,
      lastUpdate: new Date()
    } // for CurrentScanners collection
    const newScannerConfig = {
      location,
      address
    } // for Config Collection
    ScannerCollection.updateAsync(
      {},
      { $push: { scanners: newScanner}}
    ); // update CurrentScanners
    ConfigCollection.updateAsync(
      {},
      { $push: {scanners: newScannerConfig}}
    ) // update config
  },

  'RemoveBeacon'(removeID) {
    currentBeaconCollection.updateAsync(
      {},
      { $pull: { beacons: { uuid: removeID } } }
    ); // pull matcvhing uuid from CurrentBeacons
    ConfigCollection.updateAsync(
      {},
      { $pull: { beacons: { uuid: removeID } } }
    ); // pull matching uuid from config
  },

  'RemoveScanner'(address) {
    ScannerCollection.updateAsync(
      {},
      { $pull: {scanners: {address: address}}}
    ); // pull matcvhing address from CurrentScanners
    ConfigCollection.updateAsync(
      {},
      { $pull: {scanners: {address: address}}}
    ) // pull matching address from Config
  },

  'IsMAC'(address) {
    if (address.length !== 17) return false; // should be 17 characters

    for (let i = 0; i < address.length; i++) {
      if ((i+1) % 3 === 0) {
        if (address[i] !== ":") {
          return false; 
        } // every 3rd character should be a ":"
      } else if (isNaN(address[i]) && !(/[a-z]/.test(address[i]))) {
          return false;
      } // rest of characters should be number or lowercase letter.
      
    }
    return true;
      
  },

  'ResetToken'(uuid) {
    currentBeaconCollection.updateAsync(
      { "beacons.uuid": uuid},
      { $set: 
        {"beacons.$.location": "-",
        "beacons.$.lastUpdate": "-"
    }}
    )
  }
  
})