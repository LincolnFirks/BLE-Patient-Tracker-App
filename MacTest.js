const getMAC = require("getmac").default;

// getMAC((err, macAddress) => {
//   if (err) {
//     console.error("Error retrieving MAC address:", err);
//   } else {
//     const localMac = macAddress;
//   }
// });

console.log(getMAC());