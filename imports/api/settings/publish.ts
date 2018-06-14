//import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";

declare var Mongo: any;

export const userSettings = new Mongo.Collection("userSettings");

if (Meteor.isServer) {
  Meteor.publish("userSettings", function userSettingsPublication() {
    if (!this.userId) return this.ready();
    
    return userSettings.find(
      { owner: this.userId },
      {
        fields: {
          authEnabled: 1,
          locked: 1,
          owner: 1
        }
      }
    );
  });

  Meteor.publish("allSettings", function allUsersPublication() {
    let admin = false;
    if (this.userId) {
      admin = Roles.userIsInRole(this.userId, ["super-admin", "admin"]);
    }

    if (!admin) {
      return this.ready();
    } else {
      return userSettings.find({});
    }
  });


  userSettings.deny({
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
