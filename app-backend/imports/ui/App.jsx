import React, { useState } from 'react';
import { useParams, BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { beaconNameCollection, beaconLocationCollection, currentBeaconCollection } from '/imports/api/TasksCollection';
import { formatDateAndTime } from '/client/main';




function HomePage({}) {
  return (
    
    <div className='welcome-page'>
      <MainNav/>
      <div>
        <h1 className='welcome-text'>Welcome to Patient Tracker</h1>
        <h2 className='welcome-text'>Here you can assign patient IDs, track patients, and view location history</h2>
      </div>
    </div>
  )
}

function AssignBeacons({beaconData}) {
  const header = ["Patient Name", "Beacon ID", "Beacon Address", "Location"];
  const [createPanel, setCreatePanel] = useState(false);
  const [editPanel, setEditPanel] = useState(false);
  const [editName, setName] = useState("");
  const [editID, setID] = useState("");

  const ToggleCreatePanel = () => {
    setCreatePanel(!createPanel);
  };
  const ToggleEditPanel = () => {
    setEditPanel(!editPanel);
  };
  const setEditName = (name) => {
    setName(name);
  }
  const setEditID = (ID) => {
    setID(ID);
  }


  const ShowEditPanel = (name, ID) => {
    setEditName(name);
    setEditID(ID);
    ToggleEditPanel();
  }

  return (
    <div className='assign-container'>
      <MainNav/>
      <div className='table-container'>
      <table className='assign-table'>
        <thead>
          <tr>
            {header.map((heading, index) => (
              <th key={index}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from(beaconData).map(([key, beacon]) => (
             
              <tr key={key.ID}>
                <td onClick={() => {ShowEditPanel(key.name, key.ID)}}>{key.name}</td>
                <td>{key.ID}</td>
                <td>{key.address}</td>
                <td>{beacon.location}</td>
              </tr>
          ))}
        </tbody>
      </table>

      <button className='assign-button' onClick={ToggleCreatePanel}>Add a Beacon</button>

      {createPanel && <AssignPanel onToggleCreatePanel={ToggleCreatePanel}/>}
      {editPanel && <EditPanel name={editName} ID={editID} onToggleEditPanel={ToggleEditPanel}/>}
      

      

      </div>
    </div>
  );
}

function AssignPanel({onToggleCreatePanel}) {
  const [IDvalue, setIDValue] = useState('');
  const [AdressValue, setAdressValue] = useState('');

  const HandleIDChange = (event) => {
    setIDValue(event.target.value);
  };

  const HandleAdressChange = (event) => {
    setAdressValue(event.target.value);
  };

  const HandleSubmit = () => {
    Meteor.call('AddBeacon', IDvalue, AdressValue);
    onToggleCreatePanel();
  }

  

  return (
    <div className='assign-panel'>
      <button className='x-button' onClick={onToggleCreatePanel} >X</button>
      <p>Create Beacon:</p>
      <p>Beacon ID:</p>
      <input 
          type="text" 
          value={IDvalue} 
          onChange={HandleIDChange} 
        />
      <p>Beacon Adress:</p>
      <input 
          type="text" 
          value={AdressValue} 
          onChange={HandleAdressChange} 
        />
      <button className='submit-button' onClick={HandleSubmit}>Submit</button>
      
    </div>
  )
}

function EditPanel({ name, ID, onToggleEditPanel }) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    
  };

  const handleSubmit = () => {
    Meteor.call('PostName', ID, inputValue);
    onToggleEditPanel();
    
  };

  const handleUnassign = () => {
    Meteor.call('PostName', ID, "-");
    onToggleEditPanel();
    
  };

  const HandleRemove = () => {
    Meteor.call('RemoveBeacon', ID);
    onToggleEditPanel();
  }

  return (
    <div className='edit-panel'>
      <button className='x-button' onClick={onToggleEditPanel}>X</button>
      <div className='inner-edit-panel'>
        <p>Edit Beacon: {name} {ID}</p>
        <p>Change name to:</p>
        <input 
          type="text" 
          value={inputValue} 
          onChange={handleInputChange} 
        />
        
      </div>
      <button className='submit-button' onClick={handleSubmit}>Submit</button>
      <button className='remove-button' onClick={HandleRemove} >Remove Beacon</button>
      <button className='unassign-button' onClick={handleUnassign} >Unassign Patient</button>
    </div>
  );
}

function MainNav({}) {
  return (
    <nav className='main-nav-bar'>
      <ul className='main-nav-list'>
        <li className='main-nav-item'><Link to="/">Home</Link></li>
        
        <li className='main-nav-item'><Link to="/assign-beacons">Assign Beacons</Link></li>
        <li className='main-nav-item'><Link to="/beacon-history">Beacon History</Link></li>
        
      </ul>
    </nav>
  )
}




function BeaconHistory({ nameHistory}) {
  const header = ["Patient", "Last Update"]
  return (
    <div className='solo-beacon-data'>
      <MainNav/>
      <table className='solo-table'>
        <thead>
          <tr>
            {header.map((item, index) => (<th key={index}>{item}</th>))}
          </tr>
        </thead>
        <tbody>
          
          {nameHistory.map((doc, index) => (

            <tr key={index}>
              <td><Link to={`/history/${doc.name}`} className='name-link'>{doc.name}</Link></td>
              <td>{formatDateAndTime(doc.time)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) 
  
}

function NameHistory({beaconData}) {
  const { name } = useParams();
  return (
    <div>
      <MainNav/>
      <div className='solo-beacon-data'>
        <p>{`${name}'s History`}</p>

        <table className='solo-table'>
          <thead>
            <tr>
              <th>Location</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {beaconData.filter(doc => doc.name === name)
              .map(doc => (
                <tr key={doc._id}> 
                    <td>{doc.location}</td>
                    <td>{formatDateAndTime(doc.time)}</td>
                  </tr>
              ))}
                  
          </tbody>
        </table>
      </div>
    </div>
    
    
  );  
}



export const App = () => {


  let currentBeacons = [];
  let beaconData = [];

  const beaconNames = useTracker(() => beaconNameCollection.find({}, {sort: { time: -1} }).fetch());
  const beaconLocations = useTracker(() => beaconLocationCollection.find({}, {sort: { time: -1} }).fetch());
  const currentBeaconsColl = useTracker(() => currentBeaconCollection.find({}).fetch());
  
  if (currentBeaconsColl.length > 0) {
    currentBeacons = currentBeaconsColl[0].beacons
    
  }

  if (currentBeacons !== null) {
    beaconData = new Map();
    currentBeacons.forEach(beacon => {
      beaconData.set(beacon, {});
      // Example key: { ID: '0001', name: 'John', address: 'e6:35:d9:9a:b9:34' }
    
  });

  /* example beaconNames entry:
    {
      _id: ObjectId('665e14292027bf90d580f96a'),
      name: 'Jane',
      time: ISODate('2024-06-07T17:12:18.874Z'),
      location: 'ICU'
    }
  */
  beaconNames.forEach(entry => {
      for (const key of beaconData.keys()) {
        if (key.name === entry.name) {
          beaconData.set(key, {time: entry.time, location: entry.location})
          return;
        }
      }
    });
  }
  
  
  return (


    <BrowserRouter>
      <div>

        <Routes>
          
          <Route path="/" element={ <HomePage/> } /> 
          <Route path="/assign-beacons" element={ 
            <AssignBeacons beaconData={beaconData}/> } /> 

          <Route path="/beacon-history" element={ <BeaconHistory nameHistory={beaconNames}/> } /> 
          <Route path="/history/:name" element={  <NameHistory beaconData={beaconLocations}/>} /> 

          
        </Routes>
      </div>

    </BrowserRouter>
  )

}


