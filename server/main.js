import { Meteor } from 'meteor/meteor';
import { TasksCollection } from '/imports/api/TasksCollection';



Meteor.publish('tasks', () => { 
  return TasksCollection.find();

});