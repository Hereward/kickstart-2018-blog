import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const userSessions = new Mongo.Collection("userSessions");

if (Meteor.isServer) {
  Meteor.publish("userSessions", function sessionsPublication() {
    return userSessions.find(
      { owner: this.userId },
      {
        fields: {
          _id: 1,
          sessionToken: 1,
          expired: 1,
          active: 1,
          auth: 1,
          expiresOn: 1,
          createdAt: 1,
          owner: 1
        }
      }
    );
  });

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


