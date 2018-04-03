import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const userSessions = new Mongo.Collection("userSessions");

if (Meteor.isServer) {
  Meteor.publish("userSessions", function sessionsPublication() {
    return userSessions.find({owner: this.userId});
  });

}

