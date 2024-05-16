import { Meteor } from 'meteor/meteor';
import { TasksCollection } from '/imports/api/TasksCollection';



Meteor.publish('tasks', () => {
  // Use a publication to subscribe to the tasks collection
  
  
  // Use reactive data source to track changes
  return TasksCollection.find();

  

});