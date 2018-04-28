import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

export const Auth = new Mongo.Collection("enhancedAuth");
//export const AuthSecret = new Mongo.Collection("enhancedAuthSecret");

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

/*
 Meteor.publish("enhancedAuth", function authPublication() {
    return Auth.find(
      { owner: this.userId },
      {
        fields: {
          verified: 1,
          owner: 1,
          enabled: 1,
          sessionId: 1
        }
      }
    );
  });
  */
