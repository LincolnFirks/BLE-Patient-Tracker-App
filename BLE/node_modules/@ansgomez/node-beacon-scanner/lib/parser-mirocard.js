/* ------------------------------------------------------------------
* node-beacon-scanner - parser-mirocard.js
*
* Copyright (c) 2017-2019, Futomi Hatano, All rights reserved.
* Copyright (c) 2021, Andres Gomez, All rights reserved.
* Released under the MIT license
* Date: 2021-03-22
* ---------------------------------------------------------------- */
'use strict';

/* ------------------------------------------------------------------
* Constructor: BeaconParserMiroCard()
* ---------------------------------------------------------------- */
const BeaconParserMirocard = function() {

};

// Debugging 
var DEBUG = false; // true when debugging
function PRINTF( msg ){ console.log(msg) }


/* ------------------------------------------------------------------
* Method: parse(peripheral)
* - peripheral: `Peripheral` object of the noble
* ---------------------------------------------------------------- */
BeaconParserMirocard.prototype.parse = function(peripheral) {
	let ad = peripheral.advertisement;
	let manu = ad.manufacturerData;

	// Debug full payload
	DEBUG&&PRINTF(manu);

	if(manu.length < 3) {
		return null;
	} else {
        if (manu.slice(1, 5).toString('hex').startsWith("01020304")) {
            DEBUG&&PRINTF("Detected Sensor MiroCard preamble");
        }
    }

	let msb3 = manu.slice(5,7).toString('hex').substring(0,4);
	let lsb3 = manu.slice(6,8).toString('hex').substring(0,4);

	// Print last 3 bytes
    DEBUG&&PRINTF(msb3);
	DEBUG&&PRINTF(lsb3);

	let humidity_raw = ((parseInt(msb3.substring(2,4),16)&0x03)<<8) + parseInt(msb3.substring(0,2),16);
    let temperature_raw = ((parseInt(lsb3.substring(0,2),16)&0xFC)>>2) + (parseInt(lsb3.substring(2,4),16)<<6);

    // conversion
    let temperature = (-40.0 + temperature_raw / 100.0).toFixed(2);
    let humidity =  (humidity_raw / 10.0).toFixed(2);

	// Print decoded values
	DEBUG&&PRINTF("Temperature: " + temperature);
	DEBUG&&PRINTF("Humidity: " + humidity);

	return {
		ad : ad,
		temp: temperature,
		rh: humidity
	};
};

module.exports = new BeaconParserMirocard();
