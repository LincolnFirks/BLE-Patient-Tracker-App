import React, { useState} from 'react';
import {  BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import {
  currentBeaconCollection, ScannerCollection
} from '/imports/api/Collections';
import { formatDateAndTime } from '/client/main.jsx';
import ms from 'ms'
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';




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
      <NavBar/>

      <Container className='table-responsive mt-3'>
        <Table striped bordered hover variant="dark">
          <thead >
            <tr >
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

        <Table striped bordered hover variant="dark">
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

      </Container>

      <div className="d-flex justify-content-center my-3" >
        <Button variant="dark primary" className='mb-3' size="lg" onClick={ToggleCreateScannerPanel}>
          Add a Scanner
        </Button>

      </div>

      <Container fluid style={{ width: '60%' }} className='text-center bg-dark p-5'>
        <p className='text-white m-0 '>To edit or remove a Beacon or Scanner:</p>
        <p className='text-white m-0'>Click anywhere on it's table entry </p>
      </Container>

      {createScannerPanel && <CreatePanel onToggleCreatePanel={ToggleCreateScannerPanel} type={"Scanner"}/>}
      {editScannerPanel && <EditPanel name={editScannerName} ID={editScannerAddress} onToggleEditPanel={ToggleEditScannerPanel} type={"Scanner"}/>}

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

    <Container fluid style={{ width: '65%' }} className='create-panel overflow-hidden'>

      <Form>

        <Button className='x-button position-absolute' variant="danger" size="sm" onClick={onToggleCreatePanel}>X</Button>
        <Form.Group className='mb-3'>
          <Form.Text>{`Create ${type}:`}</Form.Text>
          <br />
          <Form.Label className='mt-3'>{`${type} ${type === "Beacon" ? "ID" : "Location"}:`}</Form.Label>
          <Form.Control 
            placeholder="Ex: Radiology"
            type="text"
            value={IDvalue}
            onChange={HandleIDChange}
          />
        </Form.Group>

        <Form.Group className='mb-3'>
          
          <Form.Label>{`MAC Address:`}</Form.Label>
          <Form.Control 
            placeholder="Ex: a1:b2:c3:d4:e5:f6"
            type="text"
            value={AddressValue}
            onChange={HandleAddressChange}
            className='mb-3'
          />
          <Form.Text >{`Enter MAC address with all letters lowercase separated by colons`}</Form.Text>
        </Form.Group>
        
      
        <Button variant="dark" size="lg" onClick={HandleSubmit}>Submit</Button>

        {ErrorPanelState && <ErrorPanel TogglePanel={ToggleErrorPanel} message={ErrorMessage}/>}
        
      </Form>

    </Container>
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

    
    <Container fluid style={{ width: '65%' }} className='edit-panel overflow-hidden'>
      <Form>

        <Button className='x-button position-absolute' variant="danger" size="sm" onClick={onToggleEditPanel}>X</Button>
        
          <Form.Text>{`Edit ${type}: ${name}`}</Form.Text>
          <br />
          {type === "Scanner" && 
            <Form.Group>
              <Form.Label className='mt-3'>Set name:</Form.Label>
              <Form.Control
                placeholder="Ex: Radiology"
                type="text"
                value={nameValue}
                onChange={handleNameChange}
              />
              <Button className='mt-3' variant="dark" size="lg" onClick={handleSubmit}>Submit</Button>

              <Button variant="dark" className='unassign-button' onClick={handleUnassign} >
              {`Unassign Location`}
              </Button>
                
            </Form.Group>

              
          }
          

        {ErrorPanelState && <ErrorPanel TogglePanel={ToggleErrorPanel} message={ErrorMessage}/>}

        <Button variant="danger" className={`remove-button-${type} mt-2`} onClick={HandleRemove} >{`Delete ${type}`}</Button>

        

      </Form>
      

      {ErrorPanelState && <ErrorPanel TogglePanel={ToggleErrorPanel} message={ErrorMessage}/>}
    </Container>
  );
}

function ErrorPanel({TogglePanel, message}) {
  return (
    <Container fluid className='error-panel overflow-hidden'>
      <Form>
        <Button variant="danger" size="sm" className='x-button' onClick={TogglePanel}>X</Button>
        <Form.Label>Error</Form.Label>
        <br/>
        <Form.Text>{message}</Form.Text>
        <br/>
        <Button variant="dark" size="md" className='mt-3' onClick={TogglePanel}>OK</Button>
      </Form>
    </Container>
  )
}

function Info({}) {
  return (
    <Container>
      <NavBar/>
      <Container fluid className='d-flex flex-column justify-content-center align-items-center'>
        <Row className='mt-5'>
          <Col className='text-center overflow-container'>
            <p className='fs-4'>Check out the following links for more info about this project: </p>
          </Col>
          
        </Row>
        <Row className='mt-3'>
          <Button href="https://github.com/LincolnFirks/BLE-Patient-Tracker-App/tree/main" target="_blank" variant="dark">GitHub Repo</Button>
        </Row>
        <Row className='mt-3'>
          <Button href="https://www.youtube.com/watch?v=VxahqHkaXiE" target="_blank" variant="dark">Video Demonstration</Button>
        </Row>
        <Row className='mt-3'>
          <Button variant="dark">Development Journey Video (Not Complete)</Button>
        </Row>
      </Container>
    </Container>
  )
}


function NavBar({}) {
  return (
    <Navbar data-bs-theme="dark" expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand >Patient Tracker</Navbar.Brand>
        <Navbar.Toggle/>
        <Navbar.Collapse>
          <Nav activeKey={window.location.pathname}>
            <Nav.Link as={NavLink} to="/" >Dashboard</Nav.Link>
            <Nav.Link as={NavLink} to="/info" >Info</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
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
          <Route path="/info" element={
            <Info/>
          }/>
        </Routes>
      </div>
    </BrowserRouter>
  )
}
