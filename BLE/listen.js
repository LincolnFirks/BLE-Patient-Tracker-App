const { client } = require("./update");
const fs = require("fs");
const config = require('./config.json')
const express = require('express');
const server = express();
const PORT = 3002;


server.post('/change', async (req, res) => {
  console.log("Recieved Post");
  await UpdateLocal();
  res.sendStatus(200);
})


server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


async function UpdateLocal() {
  const myDB = client.db(config.database);
  const nameCollection = myDB.collection(config.CurrentBeaconsCollection);
  const currentBeaconsDB = await nameCollection.findOne();
  fs.writeFileSync('beacons.json', JSON.stringify(currentBeaconsDB), "utf-8");
  console.log("Local file beacons changed")
}

module.exports = {
  UpdateLocal
}