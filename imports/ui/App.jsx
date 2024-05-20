import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { beacon1Collection, beacon2Collection } from '/imports/api/TasksCollection';





function BeaconTitle({ beaconName }) {
  return (
    <th colSpan="2">
      {beaconName}
    </th>
  )
}

function BeaconEntry( { entry } ) {
  const status = entry.status;
  const time = entry.time;
  return (
    <tr>
      <td>{status}</td>
      <td>{time}</td>
    </tr>
  )
}
function BeaconTable({ entries, beaconName }) {
 
  return (
    <table className="table">
      <thead>
        <tr>
          <BeaconTitle beaconName={beaconName}/>
          
        </tr>
      </thead>
      <tbody>
        { entries.map((entry, index) => (
          <BeaconEntry key={index} entry={entry}/>
        ))}
      </tbody>
    </table>
  )
}

export const App = () => {
  const beacon1Data = useTracker(() => beacon1Collection.find().fetch());
  const beacon2Data = useTracker(() => beacon2Collection.find().fetch());
  beacon1Data.reverse();
  beacon2Data.reverse();
  
  return (
    <div className="app">
      <BeaconTable entries={ beacon1Data } beaconName = "beacon1"/>
      <BeaconTable entries={ beacon2Data } beaconName = "beacon2"/>
      <table></table>
      <table></table>
      <table></table>
      <table></table>
    </div>
    
  )

}



// export const App = () => {
//   const tasks = useTracker(() => TasksCollection.find().fetch());
//   taskHistory = [];
//   tasks.map(task => {
//     taskHistory.unshift(task);
//   })

//   return (
//     <div id="webpage">

//       <h1>Beacon Tracking</h1>

//       <div id="beaconcontainer">

//         <div>
//           <h2>Beacon1</h2>
//           <p>Last Entry: {tasks[0]?.entry}</p>
//           <p>Past: 
//             <ul>
//               {taskHistory.map(task => (
//                 <li> {task.entry}</li>
//               ))}
//             </ul>

//           </p>
//         </div>
//         <div>
//           <h2>Beacon2</h2>
//         </div>
//         <div>
//           <h2>Beacon3</h2>
//         </div>
//         <div>
//           <h2>Beacon4</h2>
//         </div>
//         <div>
//           <h2>Beacon5</h2>
//         </div>

//       </div>

//     </div>
//   );
// };