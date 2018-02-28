import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

export const Auth = new Mongo.Collection("enhancedAuth");

if (Meteor.isServer) {
  Meteor.publish("enhancedAuth", function authPublication() {
    return Auth.find({owner: this.userId});
  });
  console.log(`Publish Auth (publish.ts)`);
}
