//import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
//import { can as userCan } from "../../modules/user";
//import { Mongo } from "meteor/mongo";

declare var Meteor: any;

declare var Mongo: any;

export const systemSettings = new Mongo.Collection("systemSettings");

if (Meteor.isServer) {
  Meteor.publish("systemSettings", function systemSettingsPublication() {
    return systemSettings.find(
      { active: true },
      {
        fields: {
          systemOnline: 1,
          active: 1,
          mainTitle: 1,
          shortTitle: 1,
          description: 1,
          copyright: 1
        }
      }
    );
  });

  Meteor.publish("allUsers", function allUsersPublication() {
    let admin = false;
    if (this.userId) {
      admin = Roles.userIsInRole(this.userId, ["super-admin", "admin"]);
    }

    if (!admin) {
      return this.ready();
    } else {
      return Meteor.users.find({});
    }
  });

  Meteor.publish("roles", function pagesPublication() {
    let admin = false;
    if (this.userId) {
      admin = Roles.userIsInRole(this.userId, ["super-admin", "admin"]);
    }

    if (!admin) {
      return this.ready();
    } else {
      return Meteor.roles.find({});
    }

    //return Pages.find();
  });

  // const MAX_USERS = 1000;

  Meteor.startup(function settingsStart() {
    let settingsRecord = systemSettings.findOne({ active: true });

    if (!settingsRecord) {
      systemSettings.insert({
        active: true,
        systemOnline: true,
        mainTitle: Meteor.settings.public.mainTitle,
        shortTitle: Meteor.settings.public.shortTitle,
        copyright: Meteor.settings.public.copyright,
        description: Meteor.settings.public.description,
        createdAt: new Date()
      });
    }
  });

  systemSettings.deny({
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
