# Real-Time Bluetooth Low Energy Patient Tracking System

This is a project I completed as a part of my time as a Development Intern at Medical Informatics Engineering.

## The Problem

Currently, healthcare workers have to manually update location of patients in a EHR (Electronic Health System). The implementation of EHR's have led to more human–computer interaction, which in some cases can take excessive time. The more time that is spent interacting with an EHR interface causes less efficient healthcare.

From [The Impact of a Location-Sensing Electronic Health Record on Clinician Efficiency and Accuracy: A Pilot Simulation Study](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6249134/#:~:text=Conclusion%20This%20pilot%20demonstrated%20in,clicks%20required%20to%20access%20information.):

“While EHRs have been represented to place patient information . . . at the fingertips of clinicians, physicians continue to struggle to efficiently and safely use these systems.”

From Study:
Average time required to locate patients with RTLS  = 11.9 ± 2.0 seconds vs. Without = 36.0 ± 5.7 seconds, 
Average rooms searched to find patient with RTLS = 1.0 ± 1.06 vs. Without = 3.8 ± 0.5

“This study suggests EHRs equipped with real-time location services (RLTS) that automates patient location and other repetitive tasks may improve physician efficiency, and ultimately, patient safety.”

King K, Quarles J, Ravi V, Chowdhury TI, Friday D, Sisson C, Feng Y. The Impact of a Location-Sensing Electronic Health Record on Clinician Efficiency and Accuracy: A Pilot Simulation Study. Appl Clin Inform. 2018 Oct;9(4):841-848. doi: 10.1055/s-0038-1675812. Epub 2018 Nov 21. PMID: 30463095; PMCID: PMC6249134.

## Design

![Diagram](diagram/graphviz.png)

BLE (Bluetooth Low Energy) tokens (iBeacons) send advertisements to scanners. The scanners then send the updates to the controller web application, which updates the database. The Web Application is created with [Meteor](https://www.meteor.com), a full stack JavaScript framework with built a built in MongoDB database and real-time updates.

The recievers can be any computer with BLE and networking capabilities (in my case, raspberry pi 4s). These recievers are placed around a healthcare clinic and update the database remotely. 

An API is included in this project that allows an EHR (or any system) to securely register and communicate with the app. An EHR can use the API to register it's endpoint for patient updates. Additionally, it can register tags; the API will generate a UUID for the tag to pass back to the EHR to associate updates with. When a BLE token moves, the Web Application will send a notification to the EHR endpoint that the UUID moved. This will allow secure transfer of information.

# Usage

[![Demonstration Video](https://img.youtube.com/vi/VxahqHkaXiE/maxresdefault.jpg)](https://www.youtube.com/watch?v=VxahqHkaXiE)

Video Demonstration of Web Application and API.

## Web Application

This application sets up the database and reads from it to display information.

If you don't have Meteor installed, run the following command:

```bash
npm install -g meteor
```

This project was designed on the release candidate version of Meteor 3.0.
If you cant get to the depreciated version of node/npm that meteor 2.x requires, run this command to install the release candidate version: 

```bash
curl https://install.meteor.com/?release=3.0-rc.1 | sh
```

 To navigate into the Meteor project and get the correct version and install dependencies, run the following commands: 

```bash
cd app-backend
meteor update --release 3.0-rc.1
npm install
meteor npm install
meteor reset
```

To start the app, simply run the following command: 
```bash
meteor
```
You can access the web application on localhost:3000 in the browser by default

Note:
Meteor's default ports are 3000 and 3001 for the web application and MongoDB database, respectively. To change this you can run:
```bash
meteor --port ####
```
Keep in mind that meteor will use the specified port + 1 to run the database on.

## BLE Scanning Devices

To get the device set up, you can run the following commands:

```bash
cd BLE
npm install
```

To start scanning for devices, run:

```bash
node BLE.js
```

If you want to set up the program for testing and run a simulation on your device, you can run the following commands:
```bash
node initialize-database.js
node beacon-sim.js
```
Note that if you change the ports or server that Meteor runs on, you will need to change "serverURL" field in config.json and run initialize-database.js again.

In it's current state, it is set up to interact with a Meteor app and database running locally on the machine (on ports 3000 and 3001) for testing purposes.

## API 

The API consists of two main functions to be called from endpoints by the EHR. (Or any system)
All requests/responses are in JSON format.

### POST /register-endpoint

#### Request Body:

The request should contain the endpoint you would like to register as well as the url of the server to register that endpoint on.

```json
{
  "endpoint": "http://EHR-endpoint/",
  "appURL": "http://web-app-endpoint/"
}
```

#### Response Body:

On a successful call:

```json
{
  "message": "Successfully registered endpoint: http://EHR-endpoint/"
}
```

On an error: 

```json
{
  "error": "An error occured during registration"
}
```

#### Method

This method is fairly straightforward. When called, the API will send the given endpoint through to the Web Application in the form of a POST /register-tag request.
The Web Application will use this to send location updates to.

### POST /register-tag

#### Request Body:

```json
{
  "tag": "New Tag",
  "appURL": "http://web-app-endpoint/"
}
```

#### Response Body:

On a successful call:

```json
{
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

On an error: 

```json
{
  "error": "Failed to register on web app"
}
```

#### Method

When called, the API will generate a version 4 UUID. This will be passed back in the response for the EHR to associate a patient with. The tag provided by the request and the generated UUID will also be sent to the web application's server via a POST /register-tag request. Here, the Web Application will associate tag with the UUID. 


