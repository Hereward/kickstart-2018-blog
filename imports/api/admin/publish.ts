import { Roles } from "meteor/alanning:roles";

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
          title: 1,
          shortTitle: 1,
          summary: 1,
          copyright: 1,
          image_id: 1
        }
      }
    );
  });

  Meteor.publish("allUsers", function allUsers() {
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

  Meteor.publish("allUsersPublic", function allUsersPublic(type="") {
    const userSortOptions: any = {
      sort: { createdAt: 1 }
    };
    return Roles.getUsersInRole(type, userSortOptions);
  });

  Meteor.publish("roles", function rolesPublication() {
    let admin = false;
    if (this.userId) {
      admin = Roles.userIsInRole(this.userId, ["super-admin", "admin"]);
    }

    if (!admin) {
      return this.ready();
    } else {
      return Meteor.roles.find({});
    }
  });

  // const MAX_USERS = 1000;

  Meteor.startup(function settingsStart() {
    let settingsRecord = systemSettings.findOne({ active: true });

    if (!settingsRecord) {
      systemSettings.insert({
        active: true,
        systemOnline: true,
        title: Meteor.settings.public.mainTitle,
        shortTitle: Meteor.settings.public.shortTitle,
        copyright: Meteor.settings.public.copyright,
        summary: Meteor.settings.public.description,
        image_id: "",
        created: new Date()
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
