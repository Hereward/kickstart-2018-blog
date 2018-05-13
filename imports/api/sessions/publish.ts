//import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

declare var Mongo: any;

export const userSessions = new Mongo.Collection("userSessions");
//export const userSessionsAuth = new Mongo.Collection("userSessionsAuth");

if (Meteor.isServer) {

  Meteor.publish("userSessions", function sessionsPublication() {
    if (!this.userId) return this.ready();
    return userSessions.find(
      { owner: this.userId },
      {
        fields: {
          _id: 1,
          sessionToken: 1,
          expired: 1,
          active: 1,
          verified: 1,
          currentAttempts: 1,
          expiresOn: 1,
          persist: 1,
          createdAt: 1,
          owner: 1
        }
      }
    );
  });
/*
  userSessionsAuth.deny({
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

  Meteor.publish("userSessionsAuth", function userSessionsAuthPublication() {
    return userSessionsAuth.find(
      { owner: this.userId },
      {
        fields: {
          _id: 1,
          sessionToken: 1,
          currentAttempts: 1,
          verified: 1,
          owner: 1
        }
      }
    );
  });
  */

  // userSessions.remove({});

  userSessions.deny({
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


