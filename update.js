const { MongoClient, ServerApiVersion } = require("mongodb");

// Replace the placeholder with your Atlas connection string
const uri = "mongodb://127.0.0.1:3001/";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);
// takes device data, and database, collection to  insert into
// is status true, device entered area. If false, it left.
function update(database, beaconName, status, time) {
  const myDB = client.db(database);
  const myColl = myDB.collection(beaconName);
  let entry;
  if (status === true) {
    entry = { beaconName,
              status: "Entered",
              time,
          };
  } else {
    entry = { beaconName,
              status: "Left",
              time,
          };
  }
  const result = myColl.insertOne(entry);
  console.log(`A document was inserted`);

}


module.exports = {
  update,
  client
}
