import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { TasksCollection } from '/imports/api/TasksCollection';


export const App = () => {
  const tasks = useTracker(() => TasksCollection.find().fetch());

  return (
    <div>
      <h1>Welcome to Meteor!!</h1>

      <ul>
        {tasks.map(task => (
          <li> {task.entry}</li>
        ))}
      </ul>
    </div>
  );
};