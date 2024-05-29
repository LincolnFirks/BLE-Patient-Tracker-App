import { Mongo } from 'meteor/mongo';
const beacons = ['0001','0002','0003','0004','0005']






export const beacon1Collection = new Mongo.Collection('0001');
export const beacon2Collection = new Mongo.Collection('0002');
export const beacon3Collection = new Mongo.Collection('0003');
export const beacon4Collection = new Mongo.Collection('0004');
export const beacon5Collection = new Mongo.Collection('0005');
export const beaconNameCollection = new Mongo.Collection('BeaconNames');
