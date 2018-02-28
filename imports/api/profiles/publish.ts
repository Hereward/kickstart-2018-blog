import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

export const Profiles = new Mongo.Collection("profiles");

if (Meteor.isServer) {
  Meteor.publish("profiles", function profilesPublication() {
    return Profiles.find({owner: this.userId});
  });
  console.log(`Publish Profiles (publish.ts)`);
}
