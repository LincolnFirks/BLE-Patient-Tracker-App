import { Meteor } from 'meteor/meteor';

import { beacon1Collection, beacon2Collection,
        beacon3Collection, beacon4Collection,
        beacon5Collection } from '/imports/api/TasksCollection';



Meteor.publish('tasks', () => { 
  return [beacon1Collection.find(), beacon2Collection.find(),
          beacon3Collection.find(), beacon4Collection.find(),
          beacon5Collection.find()];

});