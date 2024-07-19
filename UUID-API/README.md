# API 

The API consists of two main functions to be called from endpoints by the EHR. (Or any system)
All requests/responses are in JSON format.

## Endpoints

### POST /register-endpoint

#### Request Body:

The request should contain the endpoint you would like to register as well as the url of the server to register that endpoint on.

```json
{
  "endpoint": "http://EHR-endpoint/",
  "appURL": "http://web-app-endpoint/"
}
```

#### Response Body:

On a successful call:

```json
{
  "message": "Successfully registered endpoint: http://EHR-endpoint/"
}
```

On an error: 

```json
{
  "error": "An error occured during registration"
}
```

#### Method

This method is fairly straightforward. When called, the API will send the given endpoint through to the Web Application in the form of a POST /register-tag request.
The Web Application will use this to send location updates to.

### POST /register-tag

#### Request Body:

```json
{
  "tag": "New Tag",
  "appURL": "http://web-app-endpoint/"
}
```

#### Response Body:

On a successful call:

```json
{
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

On an error: 

```json
{
  "error": "Failed to register on web app"
}
```

#### Method

When called, the API will generate a version 4 UUID. This will be passed back in the response for the EHR to associate a patient with. The tag provided by the request and the generated UUID will also be sent to the web application's server via a POST /register-tag request. Here, the Web Application will associate tag with the UUID. 

## Usage

To activate the API, navigate the to the current folder (UUID-API) and run the following commands:

To set up:

```bash
npm install
```

To run the API:

```bash
node server.js
```