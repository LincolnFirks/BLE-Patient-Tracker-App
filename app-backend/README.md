## Web Application

This application sets up the MongoDB database and reads from it to display information.

This project was designed on the release candidate version of Meteor 3.0. It will be migrated to Meteor 3.0 when it fully releases.

Navigate into the Meteor project (app-backend), and run this command to install the correct release candidate version (on MAC): 

```bash
curl https://install.meteor.com/?release=3.0-rc.1 | sh
```

Then, you can install dependencies by running the following commands: 

```bash
npm install
meteor npm install
meteor reset
```

To start the app, simply run the following command: 
```bash
meteor
```
You can access the web application at http://localhost:3000 in the browser by default

Note:
Meteor's default ports are 3000 and 3001 for the web application and MongoDB database, respectively. To change this when booting the app up, you can run:
```bash
meteor --port ####
```
Keep in mind that meteor will use the specified port + 1 to run the database on.