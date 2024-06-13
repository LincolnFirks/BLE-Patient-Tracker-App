import { Meteor } from 'meteor/meteor';
<<<<<<< HEAD
import { beaconLocationCollection, beaconNameCollection, currentBeaconCollection  } from '/imports/api/TasksCollection';
import axios from 'axios';
import { Mongo } from 'meteor/mongo'





Meteor.publish('tasks', () => { 
  return [beaconLocationCollection.find(),beaconNameCollection.find(), currentBeaconCollection.find()];
=======
import {
  beaconLocationCollection, beaconNameCollection,
  currentBeaconCollection, ConfigCollection, ScannerCollection
} from '/imports/api/TasksCollection';
import { WebApp } from 'meteor/webapp'
import bodyParser from 'body-parser';
>>>>>>> test-interval-updates

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
<<<<<<< HEAD
  'PostName'(ID, newName) {
=======
  'PostName'(ID, newName) { // change name in database
>>>>>>> test-interval-updates

    const timestamp = new Date();

    currentBeaconCollection.updateAsync(
<<<<<<< HEAD
      { 'beacons.ID': ID},
      { $set: { 'beacons.$.name': newName } }
    );

    Meteor.call('PostChange');

    beaconLocationCollection.findOneAsync(
      { beaconID: ID }
=======
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
>>>>>>> test-interval-updates
    ).then(doc => {
      beaconLocationCollection.insertAsync({
        beaconID: ID,
        name: newName,
        address: doc.address,
        location: doc.location,
        time: timestamp
      })
<<<<<<< HEAD
    });

    beaconNameCollection.updateAsync(
      { name: newName }, 
      { $set: { time: timestamp } }, 
      { upsert: true } 
    )
    
=======
      // make location entry with that location
    });

    beaconNameCollection.updateAsync(
      { name: newName },
      { $set: { time: timestamp } },
      { upsert: true }
    ) // update Name collection if new name or just timestamp
>>>>>>> test-interval-updates
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

<<<<<<< HEAD
    Meteor.call('PostChange');
=======
    ConfigCollection.updateAsync(
      {},
      { $push: { beacons: newBeaconConfig } }
    );
>>>>>>> test-interval-updates
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
<<<<<<< HEAD
    Meteor.call('PostChange');

  },

  'PostChange'() {

    const postURLs = [
      'http://localhost:3002/change'
    ]

    postURLs.forEach(URL => {
      axios.post(URL)
        .catch(error => console.log("Axios post failed"));
    });
=======
>>>>>>> test-interval-updates
  }
})