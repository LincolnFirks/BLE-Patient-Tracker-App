import { Meteor } from 'meteor/meteor';

import {
  beaconLocationCollection, beaconNameCollection,
  currentBeaconCollection, ConfigCollection, ScannerCollection
} from '/imports/api/TasksCollection';
import { WebApp } from 'meteor/webapp'
import bodyParser from 'body-parser';


Meteor.publish('data', () => {
  return [beaconLocationCollection.find(), beaconNameCollection.find(),
  currentBeaconCollection.find(), ConfigCollection.find(), ScannerCollection.find()];
});

WebApp.connectHandlers.use(bodyParser.json());

WebApp.connectHandlers.use('/config-update', (req, res, next) => {
  if (req.method === 'POST') {
    ScannerCollection.updateAsync(
      { 'scanners.address': req.body.address },
      { $set: { 'scanners.$.lastUpdate': new Date() } }
    )
    console.log(req.body)
  }
}); // recieve notifcation from device that config was updated.

Meteor.methods({

  async 'PostBeaconName'(ID, newName) { // change name in database
    let result = await currentBeaconCollection.findOneAsync(
      { "beacons.name": newName }
    );
    
    if (result) {
      return true;
    }

    const timestamp = new Date();

    currentBeaconCollection.updateAsync(
      { 'beacons.ID': ID },
      { $set: { 'beacons.$.name': newName } }
    ); // change name in CurrentBeacons

    ConfigCollection.updateAsync(
      { 'beacons.ID': ID },
      { $set: { 'beacons.$.name': newName } }
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
            name: newName,
            address: doc.address,
            location: doc.location,
            time: timestamp
          })
        } // make location entry with that location
      });

      beaconNameCollection.updateAsync(
        { name: newName },
        { $set: { time: timestamp } },
        { upsert: true }
      ) // update Name collection if new name or just timestamp
    }

  
  },

  async 'PostScannerLocation'(address, newLocation) { // change name in database

    let result = await ScannerCollection.findOneAsync(
      { "scanners.location": newLocation }
    );
    
    if (result) {
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
      name: "-",
      address,
      location: "-"
    } // entry for currentBeacons
    const newBeaconConfig = {
      ID,
      name: "-",
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