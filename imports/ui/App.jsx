import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { beacon1Collection, beacon2Collection,
        beacon3Collection, beacon4Collection,
        beacon5Collection, beacon6Collection } from '/imports/api/TasksCollection';
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
  const header = ["BeaconID", "Beacon Address", "Location"];
  const [createPanel, setCreatePanel] = useState(false);
  const [editPanel, setEditPanel] = useState(false);
  const [editID, setID] = useState("");

  const ToggleCreatePanel = () => {
    setCreatePanel(!createPanel);
  };
  const ToggleEditPanel = () => {
    setEditPanel(!editPanel);
  };
  const setEditID = (beaconID) => {
    setID(beaconID);
  }


  const ShowEditPanel = (beaconID) => {
    setEditID(beaconID);
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
              <tr key={index}>
                <td onClick={() => {ShowEditPanel(beacon[0].beaconID)}}>{beacon[0].beaconID}</td>
                <td>{beacon[0].address}</td>
                <td>{beacon[0].location}</td>
              </tr>
            ))}
        </tbody>
      </table>

      <button className='assign-button' onClick={ToggleCreatePanel}>Add a Beacon</button>

      {createPanel && <AssignPanel />}
      {editPanel && <EditPanel beaconID={editID}/>}
      

      

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

function EditPanel({beaconID}) {
  return (
    <div className='edit-panel'>
      <p>Edit Beacon: {beaconID}</p>
    </div>
  )
}

function MainNav({}) {
  return (
    <nav className='main-nav-bar'>
      <ul className='main-nav-list'>
        <li className='main-nav-item'><Link to="/">Home</Link></li>
        <li className='main-nav-item'><Link to="/beacons">Patient Overview</Link></li>
        <li className='main-nav-item'><Link to="/assign-beacons">Assign Beacons</Link></li>
        
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

export const App = () => {
  const beacon1Data = useTracker(() => beacon1Collection.find({}, {sort: { time: -1} }).fetch());
  const beacon2Data = useTracker(() => beacon2Collection.find({}, {sort: { time: -1} }).fetch());
  const beacon3Data = useTracker(() => beacon3Collection.find({}, {sort: { time: -1} }).fetch());
  const beacon4Data = useTracker(() => beacon4Collection.find({}, {sort: { time: -1} }).fetch());
  const beacon5Data = useTracker(() => beacon5Collection.find({}, {sort: { time: -1} }).fetch());
  // const [beacon1ID, setBeacon1] = useState("beacon1");
  // const [beacon2ID, setBeacon2] = useState("beacon2");
  // const [beacon3ID, setBeacon3] = useState("beacon3");
  // const [beacon4ID, setBeacon4] = useState("beacon4");
  // const [beacon5ID, setBeacon5] = useState("beacon5");
  // const [beacon6ID, setBeacon6] = useState("beacon6");
  const beaconArray = [beacon1Data,beacon2Data,beacon3Data,beacon4Data,beacon5Data]

 

  
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

          
        </Routes>
      </div>

    </BrowserRouter>
  )

}


