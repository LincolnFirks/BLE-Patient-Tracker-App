import React, { useState} from 'react';
import {  BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import {
  currentBeaconCollection, ScannerCollection
} from '/imports/api/Collections';
import { formatDateAndTime } from '/client/main';
import ms from 'ms'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';


function BeaconOverview({ currentBeacons, currentScanners }) {
  const [editBeaconPanel, setEditBeaconPanel] = useState(false);
  const [editBeaconName, setBeaconName] = useState("");
  const [editBeaconID, setBeaconID] = useState("");


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

  const beaconHeader = ["Tag", "UUID", "Location", "Last Update"];
  const scannerHeader = ["Location", "MAC Address", "Status"]

  return (
    <Container>
      <div className='table-responsive'>
        <Table striped bordered hover>
          <thead>
            <tr>
              {beaconHeader.map((heading, index) => (
                <th scope="col" key={index}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentBeacons.map((beacon, index) => (

              <tr scope="row" key={index}>
                <td onClick={() => { ShowEditBeaconPanel(beacon.tag, beacon.uuid) }}>{beacon.tag}</td>
                <td onClick={() => { ShowEditBeaconPanel(beacon.tag, beacon.uuid) }}>{beacon.uuid}</td>
                <td onClick={() => { ShowEditBeaconPanel(beacon.tag, beacon.uuid) }}>{beacon.location}</td>
                <td onClick={() => { ShowEditBeaconPanel(beacon.tag, beacon.uuid) }}>{formatDateAndTime(beacon.lastUpdate)}</td>
              
              </tr>
            ))}
          </tbody>
        </Table>

        {editBeaconPanel && <EditPanel name={editBeaconName} ID={editBeaconID} onToggleEditPanel={ToggleEditBeaconPanel} type={"Beacon"}/>}

        <Table striped bordered hover>
          <thead>
            <tr>
              {scannerHeader.map((heading, index) => (
                <th scope="col" key={index}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentScanners.map((scanner, index) => {

              return (
                <tr scope="row" key={index}>
                  <td onClick={() => { ShowEditScannerPanel(scanner.location, scanner.address) }}>{scanner.location}</td>
                  <td onClick={() => { ShowEditScannerPanel(scanner.location, scanner.address) }}>{scanner.address}</td>
                  <td onClick={() => { ShowEditScannerPanel(scanner.location, scanner.address) }}>{scanner.status}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>

        <Button onClick={ToggleCreateScannerPanel}>Add a Scanner</Button>

        {createScannerPanel && <CreatePanel onToggleCreatePanel={ToggleCreateScannerPanel} type={"Scanner"}/>}
        {editScannerPanel && <EditPanel name={editScannerName} ID={editScannerAddress} onToggleEditPanel={ToggleEditScannerPanel} type={"Scanner"}/>}

        <p className="instructions">To edit or remove a Beacon or Scanner:</p>
        <p className="instructions">Click anywhere on it's table entry </p>
      </div>
    </Container>
  );
}

function CreatePanel({ onToggleCreatePanel, type }) {
  const [IDvalue, setIDValue] = useState('');
  const [AddressValue, setAddressValue] = useState('');
  const [ErrorPanelState, setErrorPanel] = useState(false);
  const [ErrorMessage, setErrorMessage] = useState('');

  //ID Value is location if scanner, ID num if beacon

  const HandleIDChange = (event) => {
    setIDValue(event.target.value);
  };

  const HandleAddressChange = (event) => {
    setAddressValue(event.target.value);
  };

  const ToggleErrorPanel = () => {
    setErrorPanel(!ErrorPanelState);
  }

  const ChangeError = (message) => {
    setErrorMessage(message);
  }

  const HandleSubmit = async () => {

    const isMAC = await new Promise((resolve, reject) => {
      Meteor.call('IsMAC', AddressValue, (error, response) => {
          if (error) {
              reject(error);
          } else {
              resolve(response);
          }
      });
    });

    if (isMAC) {
      let result;
      
      let method = `Add${type}`
      
      result = await new Promise((resolve, reject) => {
          Meteor.call(method, IDvalue, AddressValue, (error, response) => {
              if (error) {
                  reject(error);
              } else {
                  resolve(response);
              }
          });
      });
      
      if (result) {
        ChangeError(`A ${type} with that MAC Address or ${(type === "Beacon") ? `ID` : `Location Name`} already exists`);
        ToggleErrorPanel();
      } else {
        onToggleCreatePanel();
      }
    } else {
      ChangeError(`Not a valid MAC address`);
      ToggleErrorPanel();
    }

    
  };

  return (

  
    <div className='assign-panel container'>
      <button className='x-button' onClick={onToggleCreatePanel}>X</button>
      <p>{`Create ${type}:`}</p>
      <p>{`${type} ${type === "Beacon" ? "ID" : "Location"}:`}</p>
      <input
        type="text"
        value={IDvalue}
        onChange={HandleIDChange}
      />
      <p>{`MAC Address:`}</p>
      <input
        type="text"
        value={AddressValue}
        onChange={HandleAddressChange}
      />
      <p className='edit-help'>{`Enter MAC address with all letters undercase separated by colons`}</p>
      <p className='edit-help'>{`Example: a1:b2:c3:d4:e5:f6`}</p>
      <Button onClick={HandleSubmit}>Submit</Button>

      {ErrorPanelState && <ErrorPanel TogglePanel={ToggleErrorPanel} message={ErrorMessage}/>}
      

    </div>

    

  )
}

function EditPanel({ name, ID, onToggleEditPanel, type }) {
  // ID is MAC address if scanner, ID number if Beacon
  const [nameValue, setNameValue] = useState('');
  const [IDValue, setIDValue] = useState('');
  const [ErrorMessage, setErrorMessage] = useState('');
  const [ErrorPanelState, setErrorPanel] = useState(false);

  const ToggleErrorPanel = () => {
    setErrorPanel(!ErrorPanelState);
  }

  const ChangeError = (message) => {
    setErrorMessage(message);
  }

  const handleNameChange = (event) => {
    setNameValue(event.target.value);
  };



  const handleSubmit = async () => {
    let result;
    let method = (type === "Beacon") ? ' PostBeaconName' : 'PostScannerLocation'

    result = await new Promise((resolve, reject) => {
      Meteor.call(method, ID, nameValue, IDValue, (error, response) => {
          if (error) {
              reject(error);
          } else {
              resolve(response);
          }
      });
    });

    if (result) {
      ChangeError(`There already exists a ${type} with that ${(type === "Beacon") ? "name or that ID is already in use" : "location"}`);
      ToggleErrorPanel();
    } else {
      onToggleEditPanel();
    }

  };

  const handleUnassign = () => {
    let method = (type === "Beacon") ? 'ResetToken' : 'PostScannerLocation'
    Meteor.call(method, ID, "-", "-");

    onToggleEditPanel();
  };

  const HandleRemove = () => {
    let method = `Remove${type}`
    Meteor.call(method, ID);
    
    onToggleEditPanel();
  }

  return (
    <div className='edit-panel'>
      <button className='x-button' onClick={onToggleEditPanel}>X</button>
      <div className='inner-edit-panel'>
        <p>{`Edit ${type}: ${name}`}</p>
        {type === "Scanner" && 
         <div class="edit-scanner">
            <p>Set name:</p>
            <input
              type="text"
              value={nameValue}
              onChange={handleNameChange}
            />
            <Button  onClick={handleSubmit}>Submit</Button>
            
          </div>
          
        }

      </div>
      <Button onClick={HandleRemove} >{`Remove ${type}`}</Button>
      <button className='unassign-button' onClick={handleUnassign} >
              {`Unassign Location`}`
            </button>
      

      {ErrorPanelState && <ErrorPanel TogglePanel={ToggleErrorPanel} message={ErrorMessage}/>}
    </div>
  );
}

function ErrorPanel({TogglePanel, message}) {
  return (
    <div className='error-panel'>
      <button className='x-button' onClick={TogglePanel}>X</button>
      <p>Error</p>
      <p>{message}</p>
    </div>
  )
}


export const App = () => {

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
          <Route path="/" element={
            <BeaconOverview currentBeacons={currentBeacons} currentScanners={currentScanners} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
