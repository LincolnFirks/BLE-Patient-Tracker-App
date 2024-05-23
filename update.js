const { MongoClient, ServerApiVersion } = require("mongodb");
const fs = require("fs");
let config = JSON.parse(fs.readFileSync("config.json", "utf-8"));


// Replace the placeholder with your Atlas connection string

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(config.serverURL,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);
// takes device data, and database, collection to  insert into
// is status true, device entered area. If false, it left.
function update(beacon, time, location) {
  const myDB = client.db(config.database);
  const myColl = myDB.collection(beacon.ID);
  let entry = {
    beaconID: beacon.ID,
    address: beacon.address,
    location,
    time
  }
  myColl.insertOne(entry);
  console.log(`A document was inserted`);
  console.log(entry)

}


module.exports = {
  update,
  client
}
