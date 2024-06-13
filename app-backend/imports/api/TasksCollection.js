import { Mongo } from 'meteor/mongo';



export const beaconNameCollection = new Mongo.Collection('BeaconNames'); // All names that have been entered
export const beaconLocationCollection = new Mongo.Collection('BeaconLocations'); // Location History of everyone
export const currentBeaconCollection = new Mongo.Collection('CurrentBeacons'); // Single doc of current active beacon IDs with location
export const ScannerCollection = new Mongo.Collection('CurrentScanners'); // configuration of current beacons
export const ConfigCollection = new Mongo.Collection('Config'); // configuration of current beacons
