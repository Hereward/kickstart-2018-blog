import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

export const Auth = new Mongo.Collection("enhancedAuth");

if (Meteor.isServer) {
  Meteor.publish("enhancedAuth", function authPublication() {
    return Auth.find(
      { owner: this.userId },
      {
        fields: {
          verified: 1,
          owner: 1,
          enabled: 1
        }
      }
    );
  });
/*
  Meteor.publish("enhancedAuthKeys", function authPublication() {
    return Auth.find(
      { owner: this.userId },
      {
        fields: {
          owner: 1,
          QRCodeURL: 1,
          private_key: 1
        }
      }
    );
  });
  */

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
