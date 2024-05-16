// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by ble-scanner.js.
import { name as packageName } from "meteor/ble-scanner";

// Write your tests here!
// Here is an example.
Tinytest.add('ble-scanner - example', function (test) {
  test.equal(packageName, "ble-scanner");
});
