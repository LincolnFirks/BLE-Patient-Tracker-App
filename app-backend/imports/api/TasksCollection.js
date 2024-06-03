import { Mongo } from 'meteor/mongo';



export const beaconNameCollection = new Mongo.Collection('BeaconNames');
export const beaconLocationCollection = new Mongo.Collection('BeaconLocations');
