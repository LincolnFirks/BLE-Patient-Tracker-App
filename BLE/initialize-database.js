
const fs = require('fs');
const axios = require('axios');

const config = JSON.parse(fs.readFileSync("./config.json"));

async function initalize() {
  await axios.post(`${config.serverURL}/initialize`, config);
  process.exit();
}

initalize();