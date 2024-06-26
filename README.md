# Real-Time Bluetooth Low Energy Patient Tracking System

This is a project I completed as a part of my time as a Development Intern at Medical Informatics Engineering

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

BLE (Bluetooth Low Energy) beacons send advertisements to recievers. The recievers then send the updates to the controller web application, which updates the database. The Web Application is created with [Meteor](https://www.meteor.com), a full stack JavaScript framework with built a built in MongoDB database and real-time updates.

The recievers can be any computer with BLE and networking capabilities (in my case, raspberry pi 4s). These recievers are placed around a healthcare clinic and update the database remotely. 


# Usage

## Web Application

This application sets up the database and reads from it to display information.

If you don't have Meteor installed, run the following command:

```bash
npm install -g meteor
```
This project was designed on the release candidate version of Meteor 3.0. To navigate into the Meteor project and get the correct version and install dependencies, run the following commands: 

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
