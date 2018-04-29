import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

export const Auth = new Mongo.Collection("enhancedAuth");

if (Meteor.isServer) {
  Auth.deny({
    insert() {
      return true;
    },
    update() {
      return true;
    },
    remove() {
      return true;
    }
  });
}


