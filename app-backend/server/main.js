import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { beacon1Collection, beacon2Collection,
        beacon3Collection, beacon4Collection,
        beacon5Collection, beaconNameCollection } from '/imports/api/TasksCollection';




Meteor.publish('tasks', () => { 
  return [beacon1Collection.find(), beacon2Collection.find(),
          beacon3Collection.find(), beacon4Collection.find(),
          beacon5Collection.find(), beaconNameCollection.find()];

});

Meteor.methods({
  'PostName'(oldName, newName) {
    const postData = {oldName, newName};
    try {
      HTTP.post('http://localhost:3002/data', { data : postData }, (err, result) => {
        if (err) console.log(err)
        else console.log('Success: ', result);
        })
    } catch (err) {
        throw new Meteor.Error('http-post-failed', 'Failed to post data', err);
    }
  }

  


})