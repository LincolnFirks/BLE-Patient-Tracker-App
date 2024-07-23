
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const appURL = process.env.APP_URL;

const config = JSON.parse(fs.readFileSync("./config.json"));

async function initalize() {
  try {
    const response = await axios.post(`${appURL}/initialize`, config);
    console.log(`${response.status}: ${response.data}`)
  } catch(error) {
    console.error(`Server error:`)
    console.error(error);
  }
  process.exit();
}

initalize();