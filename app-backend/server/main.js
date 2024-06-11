import { Meteor } from 'meteor/meteor';
import { beaconLocationCollection, beaconNameCollection, currentBeaconCollection  } from '/imports/api/TasksCollection';
import axios from 'axios';





Meteor.publish('tasks', () => { 
  return [beaconLocationCollection.find(),beaconNameCollection.find(), currentBeaconCollection.find()];

});

Meteor.methods({
  'PostName'(oldID, newName) {
    currentBeaconCollection.updateAsync(
      { 'beacons.ID': oldID},
      { $set: { 'beacons.$.name': newName } }
    );

    Meteor.call('PostChange');
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
        .catch(error => console.error(error));
    });
  }

  


})