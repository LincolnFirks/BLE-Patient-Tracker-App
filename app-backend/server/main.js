import { Meteor } from 'meteor/meteor';
import { beaconLocationCollection, beaconNameCollection, currentBeaconCollection  } from '/imports/api/TasksCollection';
import axios from 'axios';
import { Mongo } from 'meteor/mongo'





Meteor.publish('tasks', () => { 
  return [beaconLocationCollection.find(),beaconNameCollection.find(), currentBeaconCollection.find()];

});

Meteor.methods({
  'PostName'(ID, newName) {

    const timestamp = new Date();

    currentBeaconCollection.updateAsync(
      { 'beacons.ID': ID},
      { $set: { 'beacons.$.name': newName } }
    );

    Meteor.call('PostChange');

    beaconLocationCollection.findOneAsync(
      { beaconID: ID }
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
      address
    }
    currentBeaconCollection.updateAsync(
      { },
      { $push: { beacons: newBeacon } }
    );

    Meteor.call('PostChange');
  },

  'RemoveBeacon'(removeID) {
    currentBeaconCollection.updateAsync(
      { },
      { $pull: { beacons: {ID: removeID } } }
    );
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
  }

  


})