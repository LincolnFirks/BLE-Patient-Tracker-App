import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { beacon1Collection, beacon2Collection,
        beacon3Collection, beacon4Collection,
        beacon5Collection, beacon6Collection } from '/imports/api/TasksCollection';

WebApp.connectHandlers.use('/data', (req, res, next) => {
        if (req.method === 'POST') {
                let body = '';
                
                // Read data from the request
                req.on('data', (chunk) => {
                        body += chunk;
                });

                // Process the received data
                req.on('end', () => {
                        console.log('Received data:', body);
                        // You can process the received data here
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end('Data received successfully');
                });
        } else {
                // For other HTTP methods, pass the request to the next handler
                next();
        }
});

Meteor.publish('tasks', () => { 
  return [beacon1Collection.find(), beacon2Collection.find(),
          beacon3Collection.find(), beacon4Collection.find(),
          beacon5Collection.find(), beacon6Collection.find()];

});