import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { Mongo } from 'meteor/mongo'
import { beaconLocationCollection, beaconNameCollection, currentBeaconCollection  } from '/imports/api/TasksCollection';





Meteor.publish('tasks', () => { 
  return [beaconLocationCollection.find(),beaconNameCollection.find(), currentBeaconCollection.find()];

});

Meteor.methods({
  'PostName'(oldID, newName) {
    currentBeaconCollection.updateAsync(
      { 'beacons.ID': oldID},
      { $set: { 'beacons.$.name': newName } }
    );
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
  },

  'RemoveBeacon'(removeID) {
    currentBeaconCollection.updateAsync(
      { },
      { $pull: { beacons: {ID: removeID } } }
    );

  }

  


})