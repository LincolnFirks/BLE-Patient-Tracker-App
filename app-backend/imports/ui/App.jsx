import React, { useState } from 'react';
import { useParams, BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import {
  beaconNameCollection, beaconLocationCollection,
  currentBeaconCollection, ScannerCollection
} from '/imports/api/TasksCollection';
import { formatDateAndTime } from '/client/main';

function HomePage({ }) {
  return (
    <div className='welcome-page'>
      <MainNav />
      <div>
        <h1 className='welcome-text'>Welcome to Patient Tracker</h1>
        <h2 className='welcome-text'>Here you can assign patient IDs, track patients, and view location history</h2>
      </div>
    </div>
  )
}

function AssignBeacons({ currentBeacons, currentScanners }) {
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

  const beaconHeader = ["Patient Name", "Beacon ID", "MAC Address", "Location"];
  const scannerHeader = ["Location", "MAC Address", "Status"]

  return (
    <div className='assign-container'>
      <MainNav />
      <div className='table-container'>
        <table className='assign-table'>
          <thead>
            <tr>
              {beaconHeader.map((heading, index) => (
                <th key={index}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentBeacons.map((beacon, index) => (

              <tr key={index}>
                <td onClick={() => { ShowEditPanel(beacon.name, beacon.ID) }}>{beacon.name}</td>
                <td>{beacon.ID}</td>
                <td>{beacon.address}</td>
                <td>{beacon.location}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className='assign-button' onClick={ToggleCreatePanel}>Add a Beacon</button>

        {createPanel && <AssignPanel onToggleCreatePanel={ToggleCreatePanel} />}
        {editPanel && <EditPanel name={editName} ID={editID} onToggleEditPanel={ToggleEditPanel} />}

        <table className='assign-table'>
          <thead>
            <tr>
              {scannerHeader.map((heading, index) => (
                <th key={index}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentScanners.map((scanner, index) => (

              <tr key={index}>
                <td>{scanner.location}</td>
                <td>{scanner.address}</td>
                <td>{formatDateAndTime(scanner.lastUpdate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}

function AssignPanel({ onToggleCreatePanel }) {
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
      <button className='x-button' onClick={onToggleCreatePanel}>X</button>
      <p>Create Beacon:</p>
      <p>Beacon ID:</p>
      <input
        type="text"
        value={IDvalue}
        onChange={HandleIDChange}
      />
      <p>Beacon Address:</p>
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

function MainNav({ }) {
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




function BeaconHistory({ nameHistory }) {
  const header = ["Patient", "Last Update"]
  return (
    <div className='solo-beacon-data'>
      <MainNav />
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

function NameHistory({ beaconData }) {
  const { name } = useParams();
  return (
    <div>
      <MainNav />
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

  const beaconNames = useTracker(() => beaconNameCollection.find({}, { sort: { time: -1 } }).fetch());
  const beaconLocations = useTracker(() => beaconLocationCollection.find({}, { sort: { time: -1 } }).fetch());
  const currentBeaconsColl = useTracker(() => currentBeaconCollection.find({}).fetch());
  const currentScannersColl = useTracker(() => ScannerCollection.find({}).fetch());

  let currentBeacons = [];
  if (currentBeaconsColl.length > 0) {
    currentBeacons = currentBeaconsColl[0].beacons
  }

  let currentScanners = [];
  if (currentScannersColl.length > 0) {
    currentScanners = currentScannersColl[0].scanners
  }

  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/assign-beacons" element={
            <AssignBeacons currentBeacons={currentBeacons} currentScanners={currentScanners} />} />
          <Route path="/beacon-history" element={<BeaconHistory nameHistory={beaconNames} />} />
          <Route path="/history/:name" element={<NameHistory beaconData={beaconLocations} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}


