import React, { useState} from 'react';
import { useParams, BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import {
  beaconNameCollection, beaconLocationCollection,
  currentBeaconCollection, ScannerCollection
} from '/imports/api/TasksCollection';
import { formatDateAndTime } from '/client/main';
import ms from 'ms'

function HomePage({ }) {
  return (
    <div className='welcome-page'>
      <MainNav currentPage={"Home"}/>
      <div>
        <h1 className='welcome-text'>Welcome to Patient Tracker</h1>
        <h2 className='welcome-text'>Here you can assign patient IDs, track patients, and view location history</h2>
      </div>
    </div>
  )
}

function BeaconOverview({ currentBeacons, currentScanners }) {
  const [createBeaconPanel, setCreateBeaconPanel] = useState(false);
  const [editBeaconPanel, setEditBeaconPanel] = useState(false);
  const [editBeaconName, setBeaconName] = useState("");
  const [editBeaconID, setBeaconID] = useState("");

  const ToggleCreateBeaconPanel = () => {
    setCreateBeaconPanel(!createBeaconPanel);
  };
  const ToggleEditBeaconPanel = () => {
    setEditBeaconPanel(!editBeaconPanel);
  };
  const setEditBeaconName = (name) => {
    setBeaconName(name);
  }
  const setEditBeaconID = (ID) => {
    setBeaconID(ID);
  }

  const ShowEditBeaconPanel = (name, ID) => {
    setEditBeaconName(name);
    setEditBeaconID(ID);
    ToggleEditBeaconPanel();
  }

  const [createScannerPanel, setCreateScannerPanel] = useState(false);
  const [editScannerPanel, setEditScannerPanel] = useState(false);
  const [editScannerName, setScannerName] = useState("");
  const [editScannerAddress, setScannerAddress] = useState("");

  const ToggleCreateScannerPanel = () => {
    setCreateScannerPanel(!createScannerPanel);
  };
  const ToggleEditScannerPanel = () => {
    setEditScannerPanel(!editScannerPanel);
  };
  const setEditScannerName = (name) => {
    setScannerName(name);
  }
  const setEditScannerAddress = (address) => {
    setScannerAddress(address);
  }

  const ShowEditScannerPanel = (name, address) => {
    setEditScannerName(name);
    setEditScannerAddress(address);
    ToggleEditScannerPanel();
  }

  const beaconHeader = ["Patient Name", "Beacon ID", "MAC Address", "Location"];
  const scannerHeader = ["Location", "MAC Address", "Status"]

  return (
    <div className='assign-container'>
      <MainNav currentPage={"Beacon Overview"}/>
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
                <td onClick={() => { ShowEditBeaconPanel(beacon.name, beacon.ID) }}>{beacon.name}</td>
                <td onClick={() => { ShowEditBeaconPanel(beacon.name, beacon.ID) }}>{beacon.ID}</td>
                <td onClick={() => { ShowEditBeaconPanel(beacon.name, beacon.ID) }}>{beacon.address}</td>
                <td onClick={() => { ShowEditBeaconPanel(beacon.name, beacon.ID) }}>{beacon.location}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className='assign-button' onClick={ToggleCreateBeaconPanel}>Add a Beacon</button>

        {createBeaconPanel && <CreatePanel onToggleCreatePanel={ToggleCreateBeaconPanel} type={"Beacon"}/>}
        {editBeaconPanel && <EditPanel name={editBeaconName} ID={editBeaconID} onToggleEditPanel={ToggleEditBeaconPanel} type={"Beacon"}/>}

        <table className='assign-table'>
          <thead>
            <tr>
              {scannerHeader.map((heading, index) => (
                <th key={index}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentScanners.map((scanner, index) => {

              return (
                <tr key={index}>
                  <td onClick={() => { ShowEditScannerPanel(scanner.location, scanner.address) }}>{scanner.location}</td>
                  <td onClick={() => { ShowEditScannerPanel(scanner.location, scanner.address) }}>{scanner.address}</td>
                  <td onClick={() => { ShowEditScannerPanel(scanner.location, scanner.address) }}>{scanner.status}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <button className='assign-button' onClick={ToggleCreateScannerPanel}>Add a Scanner</button>

        {createScannerPanel && <CreatePanel onToggleCreatePanel={ToggleCreateScannerPanel} type={"Scanner"}/>}
        {editScannerPanel && <EditPanel name={editScannerName} ID={editScannerAddress} onToggleEditPanel={ToggleEditScannerPanel} type={"Scanner"}/>}

        <p className="instructions">To edit or remove a Beacon or Scanner:</p>
        <p className="instructions">Click anywhere on it's table entry </p>
      </div>
    </div>
  );
}

function CreatePanel({ onToggleCreatePanel, type }) {
  const [IDvalue, setIDValue] = useState('');
  const [AddressValue, setAddressValue] = useState('');

  //ID Value is location if scanner, ID num if beacon

  const HandleIDChange = (event) => {
    setIDValue(event.target.value);
  };

  const HandleAddressChange = (event) => {
    setAddressValue(event.target.value);
  };

  const HandleSubmit = () => {
    (type === "Beacon") && Meteor.call('AddBeacon', IDvalue, AddressValue);
    (type === "Scanner") && Meteor.call('AddScanner', IDvalue, AddressValue);
    onToggleCreatePanel();
  }

  return (
    <div className='assign-panel'>
      <button className='x-button' onClick={onToggleCreatePanel}>X</button>
      <p>{`Create ${type}:`}</p>
      <p>{`${type} ${type === "Beacon" ? "ID" : "Location"}:`}</p>
      <input
        type="text"
        value={IDvalue}
        onChange={HandleIDChange}
      />
      <p>{`${type} Address:`}</p>
      <input
        type="text"
        value={AddressValue}
        onChange={HandleAddressChange}
      />
      <button className='submit-button' onClick={HandleSubmit}>Submit</button>

    </div>
  )
}

function EditPanel({ name, ID, onToggleEditPanel, type }) {
  // ID is MAC address if scanner, ID number if Beacon
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = () => {
    (type === "Beacon") && Meteor.call('PostBeaconName', ID, inputValue);
    (type === "Scanner") && Meteor.call('PostScannerLocation', ID, inputValue);
    onToggleEditPanel();
  };

  const handleUnassign = () => {
    (type === "Beacon") && Meteor.call('PostBeaconName', ID, "-");
    (type === "Scanner") && Meteor.call('PostScannerLocation', ID, "-");
    onToggleEditPanel();
  };

  const HandleRemove = () => {
    (type === "Beacon") && Meteor.call('RemoveBeacon', ID);
    (type === "Scanner") && Meteor.call('RemoveScanner', ID);
    onToggleEditPanel();
  }

  return (
    <div className='edit-panel'>
      <button className='x-button' onClick={onToggleEditPanel}>X</button>
      <div className='inner-edit-panel'>
        <p>{`Edit ${type}: ${name}`}</p>
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

function MainNav({ currentPage }) {
  return (
    <nav className='main-nav-bar'>
      <ul className='main-nav-list'>
        <li className={`main-nav-item ${currentPage === "Home" ? "active-nav-item" : ""}`}>
          <Link to="/">Home</Link></li>
        <li className={`main-nav-item ${currentPage === "Beacon Overview" ? "active-nav-item" : ""}`}>
          <Link to="/beacon-overview">Beacon Overview</Link></li>
        <li className={`main-nav-item ${currentPage === "Beacon History" ? "active-nav-item" : ""}`}>
          <Link to="/beacon-history">Beacon History</Link></li>
      </ul>
    </nav>
  )
}




function BeaconHistory({ nameHistory }) {
  const header = ["Patient", "Last Update"]
  return (
    <div className='solo-beacon-data'>
      <MainNav currentPage={"Beacon History"}/>
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
  

  let currentBeacons = [];
  if (currentBeaconsColl.length > 0) {
    currentBeacons = currentBeaconsColl[0].beacons
  }

  const [currentScanners, setCurrentScanners] = useState([]);
  
  const fetchScanners = async () => {
    const scannersColl = await ScannerCollection.find({}).fetch();
    const scanners = scannersColl.length > 0 ? scannersColl[0].scanners : [];

    scanners.forEach(scanner => {
      const since = new Date() - scanner.lastUpdate;
      scanner.status = since > 5000 ? `Offline for ${ms(since, {long: true})}` : "Online";
    });

    setCurrentScanners(scanners);
  };
  fetchScanners();



  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/beacon-overview" element={
            <BeaconOverview currentBeacons={currentBeacons} currentScanners={currentScanners} />} />
          <Route path="/beacon-history" element={<BeaconHistory nameHistory={beaconNames} />} />
          <Route path="/history/:name" element={<NameHistory beaconData={beaconLocations} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
