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
    console.log(req.body)
  }
}); // recieve notifcation from device that config was updated.

Meteor.methods({

  'PostName'(ID, newName) { // change name in database
    const timestamp = new Date();

    currentBeaconCollection.updateAsync(
      { 'beacons.ID': ID },
      { $set: { 'beacons.$.name': newName } }
    ); // change name in CurrentBeacons

    ConfigCollection.updateAsync(
      { 'beacons.ID': ID },
      { $set: { 'beacons.$.name': newName } }
    ); // change name in Config

    // make entry at current location for new name
    beaconLocationCollection.findOneAsync( 
      { beaconID: ID }, { sort: { time: -1 } }
      // get most recent entry with this beacon
    ).then(doc => {
      beaconLocationCollection.insertAsync({
        beaconID: ID,
        name: newName,
        address: doc.address,
        location: doc.location,
        time: timestamp
      })

      // make location entry with that location
    });

    beaconNameCollection.updateAsync(
      { name: newName },
      { $set: { time: timestamp } },
      { upsert: true }
    ) // update Name collection if new name or just timestamp
  },

  'AddBeacon'(ID, address) {
    const newBeacon = {
      ID,
      name: "-",
      address,
      location: "-"
    } // entry for curretnBeacons
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

  'RemoveBeacon'(removeID) {
    currentBeaconCollection.updateAsync(
      {},
      { $pull: { beacons: { ID: removeID } } }
    );
    ConfigCollection.updateAsync(
      {},
      { $pull: { beacons: { ID: removeID } } }
    );
  }
})