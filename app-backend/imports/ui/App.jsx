import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { beacon1Collection,beacon2Collection,beacon3Collection,beacon4Collection,beacon5Collection, beaconNameCollection } from '/imports/api/TasksCollection';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";




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
  const [editID, setID] = useState("");

  const ToggleCreatePanel = () => {
    setCreatePanel(!createPanel);
  };
  const ToggleEditPanel = () => {
    setEditPanel(!editPanel);
  };
  const setEditID = (name) => {
    setID(name);
  }


  const ShowEditPanel = (name) => {
    setEditID(name);
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
           {beaconData.map((beacon, index) => (
              beacon.length > 0 ? 
                <tr key={index}>
                  <td onClick={() => {ShowEditPanel(beacon[0].name)}}>{beacon[0].name}</td>
                  <td>{beacon[0].beaconID}</td>
                  <td>{beacon[0].address}</td>
                  <td>{beacon[0].location}</td>
                </tr> : <tr key={index}></tr>
              
            ))}
        </tbody>
      </table>

      <button className='assign-button' onClick={ToggleCreatePanel}>Add a Beacon</button>

      {createPanel && <AssignPanel />}
      {editPanel && <EditPanel name={editID}/>}
      

      

      </div>
    </div>
  );
}

function AssignPanel() {
  return (
    <div className='assign-panel'>
      <p>Assign Panel</p>
    </div>
  )
}

function EditPanel({ name }) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    Meteor.call('PostName', name, inputValue);
  };

  return (
    <div className='edit-panel'>
      <div className='inner-edit-panel'>
        <p>Edit Beacon: {name}</p>
        <p>Change name to:</p>
        <input 
          type="text" 
          value={inputValue} 
          onChange={handleInputChange} 
        />
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}

function MainNav({}) {
  return (
    <nav className='main-nav-bar'>
      <ul className='main-nav-list'>
        <li className='main-nav-item'><Link to="/">Home</Link></li>
        <li className='main-nav-item'><Link to="/beacons">Patient Overview</Link></li>
        <li className='main-nav-item'><Link to="/assign-beacons">Assign Beacons</Link></li>
        <li className='main-nav-item'><Link to="/beacon-history">Beacon History</Link></li>
        
      </ul>
    </nav>
  )
}




function BeaconTitle({ beaconName }) {
  return (
    <th colSpan="2">
      {beaconName}
    </th>
  )
}

function BeaconEntry( { entry } ) {
  let time = entry.time;
  let location = entry.location;
  const formattedDate = time.toLocaleDateString('en-US');
  const formattedTime = time.toLocaleTimeString('en-US');
  time = formattedDate + " " + formattedTime;
  return (
    <tr>
      <td>{location}</td>
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

function SoloBeaconTable({ entries, beaconName }) {
 
  return (
    <div>
      <MainNav/>
      <div className='solo-beacon-data'>
        <table className="solo-table">
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
      </div>
      

      
    </div>
    
  )
}

function BeaconHistory({beaconHistory, nameHistory}) {
  const header = ["Patient", "Last Update"]
  return (
    <div className='solo-beacon-data'>
      <MainNav/>
      <table className='solo-table'>
        <thead>
          <tr>
            {header.map((item, index) => (<td key={index}>{item}</td>))}
          </tr>
        </thead>
        <tbody>
          {console.log(nameHistory)}
          {nameHistory.map((doc, index) => (

            <tr key={index}>
              <td>{doc.name}</td>
              <td>{"time"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) 
  
}



export const App = () => {
  const beacon1Data = useTracker(() => beacon1Collection.find({}, {sort: { time: -1} }).fetch());
  const beacon2Data = useTracker(() => beacon2Collection.find({}, {sort: { time: -1} }).fetch());
  const beacon3Data = useTracker(() => beacon3Collection.find({}, {sort: { time: -1} }).fetch());
  const beacon4Data = useTracker(() => beacon4Collection.find({}, {sort: { time: -1} }).fetch());
  const beacon5Data = useTracker(() => beacon5Collection.find({}, {sort: { time: -1} }).fetch());
  const beaconArray = [beacon1Data,beacon2Data,beacon3Data,beacon4Data,beacon5Data]
  const beaconNames = useTracker(() => beaconNameCollection.find({}, {sort: { time: -1} }).fetch());

 
  

 

  
  return (


    <BrowserRouter>
      <div>

        <Routes>
          <Route path="/beacon1" element={ <SoloBeaconTable entries={ beacon1Data } beaconName = "beacon1"/> } /> 
          <Route path="/beacon2" element={ <SoloBeaconTable entries={ beacon2Data } beaconName = "beacon2"/> } /> 
          <Route path="/beacon3" element={ <SoloBeaconTable entries={ beacon3Data } beaconName = "beacon3"/> } /> 
          <Route path="/beacon4" element={ <SoloBeaconTable entries={ beacon4Data } beaconName = "beacon4"/> } /> 
          <Route path="/beacon5" element={ <SoloBeaconTable entries={ beacon5Data } beaconName = "beacon5"/> } /> 
          <Route path="/beacons" element={
            <div className='beacon-overview'>

              <MainNav/>  
              <div className='all-beacon-data'>
                <nav className='nav-bar'>
                  <ul className='nav-list'>
                    <li className='nav-item'><Link to="/beacon1">Beacon 1</Link></li>
                    <li className='nav-item'><Link to="/beacon2">Beacon 2</Link></li>
                    <li className='nav-item'><Link to="/beacon3">Beacon 3</Link></li>
                    <li className='nav-item'><Link to="/beacon4">Beacon 4</Link></li>
                    <li className='nav-item'><Link to="/beacon5">Beacon 5</Link></li>
                    <li className='nav-item'><Link to="/beacon6">Beacon 6</Link></li>
                    
                  </ul>
                </nav>

                
              
              
                <div className="app">
                  
                  <BeaconTable entries={ beacon1Data } beaconName = "beacon1"/>
                  <BeaconTable entries={ beacon2Data } beaconName = "beacon2"/>
                  <BeaconTable entries={ beacon3Data } beaconName = "beacon3"/>
                  <BeaconTable entries={ beacon4Data } beaconName = "beacon4"/>
                  <BeaconTable entries={ beacon5Data } beaconName = "beacon5"/>
           
                </div> 
              </div>
              
            </div>
          } />
          <Route path="/" element={ <HomePage/> } /> 
          <Route path="/assign-beacons" element={ 
            <AssignBeacons beaconData={beaconArray}/> } /> 

          <Route path="/beacon-history" element={ <BeaconHistory beaconHistory={beaconArray} nameHistory={beaconNames}/> } /> 

          
        </Routes>
      </div>

    </BrowserRouter>
  )

}


