///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Auth } from "../auth/publish";
import { userSessions } from "../sessions/publish";
import { userSettings } from "../settings/publish";
import { Profiles } from "../profiles/publish";
import { Images } from "../images/methods";
import { can as userCan } from "../../modules/user";
import { systemSettings } from "./publish";
import { lockAccountToggle } from "../sessions/methods";

const authCheck = (methodName, userId, threshold = "") => {
  let auth = false;
  if (userId) {
    if (userCan({ do: methodName, threshold: threshold })) {
      auth = true;
    }
  }

  if (!auth) {
    console.log(`authCheck (${methodName}) - NOT AUTHORISED FOR ADMIN`);
    throw new Meteor.Error(
      `not-authorized for admin [${methodName}]`,
      "Must be administrator to access this function."
    );
  }
  return auth;
};

export const updateSettings = new ValidatedMethod({
  name: "admin.updateSettings",
  validate: new SimpleSchema({
    mainTitle: { type: String },
    shortTitle: { type: String },
    copyright: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("updateSettings", this.userId, "admin");

      systemSettings.update(
        { active: true },
        {
          $set: {
            mainTitle: fields.mainTitle,
            shortTitle: fields.shortTitle,
            copyright: fields.copyright
          }
        }
      );
    }

    return true;
  }
});

export const toggleLocked = new ValidatedMethod({
  name: "admin.toggleLocked",

  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),

  run(fields) {
    authCheck("toggleLocked", this.userId, "admin");
    //log.info(`toggleLocked`, fields);
    lockAccountToggle(fields.id);
  }
});

export const toggleSystemOnline = new ValidatedMethod({
  name: "admin.toggleSystemOnline",

  validate: null,

  run(fields) {
    authCheck("toggleSystemOnline", this.userId, "admin");
    //let ownerId = this.userId;
    let settingsRecord: any;
    settingsRecord = systemSettings.findOne({ active: true });

    if (settingsRecord) {
      let currentState = settingsRecord.systemOnline;
      let newState = !currentState;
      systemSettings.update(settingsRecord._id, { $set: { systemOnline: newState } });
    }
  }
});

export const assignRolesNewUser = new ValidatedMethod({
  name: "admin.assignRoles",
  validate: null,

  run(fields) {
    if (!this.isSimulation) {
      authCheck("assignRolesNewUser", this.userId);
      let userRoles = ["user"];
      let email = Meteor.user().emails[0].address;
      if (email === Meteor.settings.private.adminEmail) {
        userRoles = ["super-admin", "god"];
      }

      Roles.setUserRoles(this.userId, userRoles);
      log.info(`assignRolesNewUser - DONE`, email, userRoles);
      //Roles.addRolesToParent('USERS_VIEW', 'admin');
    }
    return true;
  }
});

export const deleteUser = new ValidatedMethod({
  name: "admin.deleteUser",
  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("deleteUser", this.userId, "admin");
      Meteor.users.remove(fields.id);
    }
    return true;
  }
});

export const deleteAllUsers = new ValidatedMethod({
  name: "deleteAllUsers",
  validate: null,

  run(fields) {
    if (!this.isSimulation) {
      authCheck("admin.deleteAllUsers", this.userId, "admin");

      //const email = Meteor.user().emails[0].address;

      //const allowed = userCan({ threshold: "god" }) && email === Meteor.settings.private.adminEmail;
      let rootAdmin: any;
      rootAdmin = Accounts.findUserByEmail(Meteor.settings.private.adminEmail);
      const excludeUsersExpression = [this.userId, rootAdmin._id];
      //const excludeUsersExpression = [{_id: this.userId}, {_id: rootAdmin._id}];
      /*
      if (!allowed) {
        throw new Meteor.Error(
          `not-authorized`,
          "Only a god using the adminEmail in Settings can execute this function."
        );
      }
      */

      let excludeImagesExpression = [];
      let userProfileRecord: any;
      userProfileRecord = Profiles.findOne({ owner: this.userId });
      let userImageId = userProfileRecord.image_id;

      if (userImageId) {
        excludeImagesExpression.push(userImageId); // {_id: userImageId}
      }

      let adminProfileRecord: any;
      adminProfileRecord = Profiles.findOne({ owner: rootAdmin._id });
      let adminImageId = adminProfileRecord.image_id;

      if (adminImageId) {
        excludeImagesExpression.push(adminImageId); // {_id: adminImageId}
      }

      log.info(
        `deleteAllUsers: excludeImagesExpression= ${excludeImagesExpression} excludeUsersExpression=${excludeUsersExpression}`
      );

      Meteor.users.remove({ _id: { $nin: excludeUsersExpression } });
      //Meteor.users.remove({ $nor: excludeUsersExpression });
      Auth.remove({ owner: { $nin: excludeUsersExpression } });
      userSessions.remove({ owner: { $nin: excludeUsersExpression } });
      userSettings.remove({ owner: { $nin: excludeUsersExpression } });
      Profiles.remove({ owner: { $nin: excludeUsersExpression } });

      /*
      Meteor.users.remove({ _id: { $ne: this.userId } });
      Auth.remove({ owner: { $ne: this.userId } });
      userSessions.remove({ owner: { $ne: this.userId } });
      userSettings.remove({ owner: { $ne: this.userId } });
      Profiles.remove({ owner: { $ne: this.userId } });
*/
      if (excludeImagesExpression.length) {
        let imagesCursor: any = Images.find({ _id: { $nin: excludeImagesExpression } });
        let imagesCount = imagesCursor.count();

        if (imagesCount) {
          const imagesArray = imagesCursor.fetch();
          log.info(`deleteAllUsers - image found! [${imagesCount}]`, imagesArray);
          Images.remove({ _id: { $nin: excludeImagesExpression } }, function remove(error) {
            if (error) {
              console.error("IMAGE File wasn't removed, error: " + error.reason);
            } else {
              console.info("IMAGE File successfully removed");
            }
          });
        }
      }

      /*
      if (imageId) {
        let imagesCursor: any = Images.find({ _id: { $ne: imageId } });
        let imagesCount = imagesCursor.count();
        let imagesArray = imagesCursor.fetch();

        if (imagesCount) {
          console.log(`deleteAllUsers - image found! [${imagesCount}]`, imagesArray);
          Images.remove({ _id: { $ne: imageId } }, function remove(error) {
            if (error) {
              console.error("IMAGE File wasn't removed, error: " + error.reason);
            } else {
              console.info("IMAGE File successfully removed");
            }
          });
        }
      }
      */
    }

    console.log(`admin.deleteAllUsers -DONE!`);

    return true;
  }
});
