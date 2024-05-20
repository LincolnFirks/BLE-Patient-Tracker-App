import { Meteor } from 'meteor/meteor';
import { beacon1Collection, beacon2Collection } from '/imports/api/TasksCollection';




Meteor.publish('tasks', () => { 
  return [beacon1Collection.find(), beacon2Collection.find()];

});