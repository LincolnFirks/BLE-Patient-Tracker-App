## Web Application

This project runs the recently released Meteor 3.0

Navigate into the Meteor project (app-backend), and run this command to install Meteor on Windows, Linux and OS X.

```bash
npx meteor
```

> [!NOTE]
> You may need to prefix this command with "sudo" for correct installation on some distributions.

If you have errors installing Meteor 3.0, please refer to the [Meteor Installation Guide](https://v3-docs.meteor.com/about/install.html)

Then, you can install dependencies by running the following commands: 

```bash
meteor npm install
```

To start the app, simply run the following command: 
```bash
meteor
```
You can access the web application at http://localhost:3000 in the browser by default

> [!NOTE]
> Meteor's default ports are 3000 and 3001 for the web application and MongoDB database, respectively. To change this when booting the app up, you can run:
> ```bash
> meteor --port ####
> ```
> Keep in mind that meteor will use the specified port + 1 to run the database on.
>
> e.g.
> ```bash
> meteor --port 5000
> ```
> will run the web application on port 5000 and the MongoDB database on port 5001
