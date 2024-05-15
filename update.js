const { MongoClient, ServerApiVersion } = require("mongodb");

// Replace the placeholder with your Atlas connection string
const uri = "mongodb://localhost:27017";

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
function update(database, collection, status, time) {
  const myDB = client.db(database);
  const myColl = myDB.collection(collection);
  let message;
  if (status === true) {
    message = { entry: `Device entered at ${time}` };
  } else {
    message = { entry: `Device left at ${time}` };
  }
  const result = myColl.insertOne(message);
  console.log(`A document was inserted`);

}


module.exports = {
  update,
  client
}
