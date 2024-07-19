const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = 3005;
const axios = require('axios');
const axiosRetry = require('axios-retry').default;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
})

app.post('/register-endpoint', async (req, res) => {
  const postData = req.body;
  if (!postData || !postData.endpoint || !postData.appURL) {
    res.status(400).json({error: 'Post data is in incorrect format.'});
  } else {
    try {
      const result = await RegisterEndpoint(postData.endpoint, postData.appURL);
      if (result) res.status(200).json({ message: `Successfuly registered endpoint: ${postData.endpoint}`});
      else res.status(500).json({error: 'Failed to register endpoint with application'});
    } catch(err) {
      res.status(500).json({error: "An error occured during registration"})
    }
    
  }
})

app.post ('/register-tag', async (req, res) => {
  const postData = req.body;
  if (!postData || !postData.tag || !postData.appURL) {
    res.status(400).json({error: 'Post data is in incorrect format.'});
  }
  else {
    try {
      postData.uuid = uuidv4(); // generate uuid
      const result = await RegisterApp(postData);
      if (result) res.status(200).json({uuid: postData.uuid}); 
      else res.status(500).json({error: 'Failed to register on web app'})
    } catch(error) {
      console.error(error);
      res.status(500).json({error: 'Failed to generate UUID'});
    }
  }
  
})

app.post

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});

axiosRetry(axios, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error);
  } 
});

async function RegisterApp(data) {
  try {
    const response = await axios.post(`${data.appURL}/register-tag`, data);
    console.log(response.data); 
    return true;
  } catch (error) {
    console.error(`Registration send to application failed: ${error}`);
    return false;
  }
}

async function RegisterEndpoint(endpoint, appURL) {
  try {
    const response = await axios.post(`${appURL}/register-endpoint`, {endpoint});
    console.log(response.data); 
    return true;
  } catch (error) {
    console.error(`Registration send to application failed: ${error}`);
    return false;
  }
}