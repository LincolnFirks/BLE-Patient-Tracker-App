import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { TasksCollection } from '/imports/api/TasksCollection';


export const App = () => {
  const tasks = useTracker(() => TasksCollection.find().fetch());
  taskHistory = [];
  tasks.map(task => {
    taskHistory.unshift(task);
  })

  return (
    <div id="webpage">

      <h1>Beacon Tracking</h1>

      <div id="beaconcontainer">

        <div>
          <h2>Beacon1</h2>
          <p>Last Entry: {tasks[0].entry}</p>
          <p>Past: 
            <ul>
              {taskHistory.map(task => (
                <li> {task.entry}</li>
              ))}
            </ul>

          </p>
        </div>
        <div>
          <h2>Beacon2</h2>
        </div>
        <div>
          <h2>Beacon3</h2>
        </div>
        <div>
          <h2>Beacon4</h2>
        </div>
        <div>
          <h2>Beacon5</h2>
        </div>

      </div>

    </div>
  );
};