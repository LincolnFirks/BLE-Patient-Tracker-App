const BeaconScanner = require('node-beacon-scanner');
const scanner = new BeaconScanner();
let count = 0;
scanner.onadvertisement = (ad) => {
  console.log(ad);
  count+=1;
  console.log(count);
};

scanner.startScan().then(() => {
  console.log('Started to scan.')  ;
}).catch((error) => {
  console.error(error);
});

setInterval(()=> {
  process.exit();
}, 60000)