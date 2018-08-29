import { Meteor } from "meteor/meteor";
//import { Mongo } from "meteor/mongo";
declare var Mongo: any;

export const Tags = new Mongo.Collection("tags");

if (Meteor.isServer) {
  Meteor.publish("tags", function tagsPublication() {
    return Tags.find();
  });
}
