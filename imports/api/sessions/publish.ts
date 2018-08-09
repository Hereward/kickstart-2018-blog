import { Meteor } from "meteor/meteor";

declare var Mongo: any;
export const userSessions = new Mongo.Collection("userSessions");

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
          created: 1,
          owner: 1
        }
      }
    );
  });

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


