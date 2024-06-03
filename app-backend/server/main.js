import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { beaconLocationCollection, beaconNameCollection } from '/imports/api/TasksCollection';




Meteor.publish('tasks', () => { 
  return [beaconLocationCollection.find(),beaconNameCollection.find()];

});

Meteor.methods({
  'PostName'(oldName, newName) {
    const postData = {oldName, newName};
    try {
      HTTP.post('http://localhost:3002/name-change', { data : postData }, (err, result) => {
        if (err) console.log(err)
        else console.log('Success: ', result);
        })
    } catch (err) {
        throw new Meteor.Error('http-post-failed', 'Failed to post data', err);
    }
  },

  'AddBeacon'(ID, Address) {
    const postData = {ID, Address}
    try {
      HTTP.post('http://localhost:3002/new-beacon', { data : postData }, (err, result) => {
        if (err) console.log(err)
        else console.log('Success: ', result);
        })
    } catch (err) {
        throw new Meteor.Error('http-post-failed', 'Failed to post data', err);
    }

  }

  


})