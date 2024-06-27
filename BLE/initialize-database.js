
const fs = require('fs');
const axios = require('axios');

const config = JSON.parse(fs.readFileSync("./config.json"));

async function initalize() {
  try {
    const response = await axios.post(`${config.serverURL}/initialize`, config);
    console.log(`${response.status}: ${response.data}`)
  } catch(error) {
    console.error(`Server error:`)
    console.error(error);
  }
  process.exit();
}

initalize();