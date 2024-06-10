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

async function update(beacon, time, location) {
  const myDB = client.db(config.database);
  const beaconColl = myDB.collection(config.beaconLocationCollection);
  
  let entry = {
    beaconID: beacon.ID,
    name: beacon.name,
    address: beacon.address,
    location,
    time
  }
  beaconColl.insertOne(entry);
  
  updateCollections(beacon.name, beacon.ID, myDB, time, location);
  

}

async function updateCollections(beaconName, beaconID, db, time, location) {
  try { // update currentBeacons with location and time
    const currentBeacons = db.collection(config.CurrentBeaconsCollection);
    currentBeacons.updateOne(
      { "beacons.ID": beaconID },
      { $set: { "beacons.$.location": location } }
    );
  } catch (error) {
    console.error("Error updating current beacon:", error);
  }

  try {
    const nameCollection = db.collection(config.beaconNameCollection);
    const checkName = await nameCollection.findOne({ name: beaconName });
    if (!checkName) {
      const result = await nameCollection.insertOne({ name: beaconName, time });
      console.log("New name inserted:", result.insertedId);
    } else {
      await nameCollection.updateOne({_id: checkName._id},{$set: {time}});
    }
  } catch (error) {
    console.error("Error inserting name:", error);
  }

}




module.exports = {
  update,
  updateCollections,
  client
}
