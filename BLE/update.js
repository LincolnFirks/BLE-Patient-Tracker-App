const { MongoClient, ServerApiVersion } = require("mongodb");

const config = require("./config.json")


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(config.databaseURL,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);

async function update(beacon, time, location, config) {
  const myDB = client.db(config.database); // get database
  const beaconColl = myDB.collection(config.beaconLocationCollection); // main collection
  
  let entry = {
    beaconID: beacon.ID,
    name: beacon.name,
    address: beacon.address,
    location,
    time
  }
  if (beacon.name !== "-") {
    beaconColl.insertOne(entry); // insert into main collection
  }
  
  updateCollections(beacon.name, beacon.ID, myDB, time, location); // update other collections
}

async function updateCollections(beaconName, beaconID, db, time, location) {
  try { // update currentBeacons with location 
    const currentBeacons = db.collection(config.CurrentBeaconsCollection);
    currentBeacons.updateOne(
      { "beacons.ID": beaconID },
      { $set: { "beacons.$.location": location } }
    );
  } catch (error) {
    console.error("Error updating current beacon:", error);
  }

  if (beaconName !== "-") {
    try { // update BeaconNames with name + timestamp
      const nameCollection = db.collection(config.beaconNameCollection);
      const checkName = await nameCollection.findOne({ name: beaconName });
      if (!checkName) {
        const result = await nameCollection.insertOne({ name: beaconName, time });
      } else {
        await nameCollection.updateOne({_id: checkName._id},{$set: {time}});
      }
    } catch (error) {
      console.error("Error updating names:", error);
    }
  }
  

}




module.exports = {
  update,
  updateCollections,
  client
}
