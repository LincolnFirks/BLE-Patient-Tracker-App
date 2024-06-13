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
});

Meteor.methods({
  'PostName'(ID, newName) {

    const timestamp = new Date();

    currentBeaconCollection.updateAsync(
      { 'beacons.ID': ID },
      { $set: { 'beacons.$.name': newName } }
    );

    ConfigCollection.updateAsync(
      { 'beacons.ID': ID },
      { $set: { 'beacons.$.name': newName } }
    );

    beaconLocationCollection.findOneAsync(
      { beaconID: ID }, { sort: { time: -1 } }
    ).then(doc => {
      beaconLocationCollection.insertAsync({
        beaconID: ID,
        name: newName,
        address: doc.address,
        location: doc.location,
        time: timestamp
      })
    });

    beaconNameCollection.updateAsync(
      { name: newName },
      { $set: { time: timestamp } },
      { upsert: true }
    )
  },

  'AddBeacon'(ID, address) {
    const newBeacon = {
      ID,
      name: "-",
      address,
      location: "-"
    }
    const newBeaconConfig = {
      ID,
      name: "-",
      address
    }
    currentBeaconCollection.updateAsync(
      {},
      { $push: { beacons: newBeacon } }
    );

    ConfigCollection.updateAsync(
      {},
      { $push: { beacons: newBeaconConfig } }
    );
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