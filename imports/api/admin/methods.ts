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
import { lockAccountToggle, insertNewSession, purgeAllOtherSessions } from "../sessions/methods";
import { createAuth } from "../auth/methods";
import { createProfile, sendVerificationEmail } from "../profiles/methods";

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

const protectedUser = (id, userId) => {
  let status = false;
  const rootAdmin = Accounts.findUserByEmail(Meteor.settings.private.adminEmail);
  const rootId = rootAdmin ? rootAdmin._id : "";
  const untouchable = rootId && (id === userId || id === rootId);
  const god = Roles.userIsInRole(userId, ["god"]);
  const elevated = Roles.userIsInRole(id, ["god", "super-admin"]);

  if (untouchable) {
    status = true;
  } else if (!god && elevated) {
    status = true;
  }

  return status;
};

function deleteOne(id) {
  const userProfileRecord = Profiles.findOne({ owner: id });
  if (userProfileRecord) {
    Images.remove(userProfileRecord._id, () => {});
  }
  Meteor.users.remove(id);
  Auth.remove({ owner: id });
  userSessions.remove({ owner: id });
  userSettings.remove({ owner: id });
  Profiles.remove({ owner: id });
}


export const configureNewUser = new ValidatedMethod({
  name: "admin.configureNewUser",
  validate: new SimpleSchema({
    type: { type: String },
    userId: { type: String },
    sessionToken: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("configureNewUser", this.userId);
      const allowMultiSession = Meteor.settings.public.session.allowMultiSession || false;

      //const userId = fields.userId ? fields.userId : this.userId;
      const userId = fields.userId;

      // ROLES
      if (fields.type === "register") {
        let userRoles = ["user"];
        const email = Meteor.user().emails[0].address;
        if (email === Meteor.settings.private.adminEmail) {
          userRoles = ["user", "super-admin", "god"];
        }

        Roles.setUserRoles(userId, userRoles);
      }

      // USER SETTINGS
      let key: any;
      let secret: any;
      userSettings.remove({ owner: userId });

      let authId = userSettings.insert({
        authEnabled: 0,
        locked: false,
        owner: userId
      });

      // USER SESSION
      const sessionId = insertNewSession(userId, fields.sessionToken);
      if (!allowMultiSession) {
        Accounts.logoutOtherClients();
        purgeAllOtherSessions.call({ sessionToken: fields.sessionToken }, (err, res) => {});
      }

      // CREATE AUTH
      createAuth.call({ userId: userId }, (err, id) => {});

      // CREATE PROFILE

      createProfile.call(
        {
          fname: "",
          initial: "",
          lname: "",
          userId: userId
        },
        (err, profileId) => {
          if (fields.type === "register") {
            sendVerificationEmail.call({ profileId: profileId, userId: userId }, (err, res) => {});
          }
        }
      );
    }

    return true;
  }
});


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

export const sendInvitation = new ValidatedMethod({
  name: "admin.sendInvitation",

  validate: new SimpleSchema({
    email: { type: String },
    name: { type: String, optional: true },
    message: { type: String, optional: true },
    roles: { type: Object, blackbox: true }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("sendInvitation", this.userId, "admin");
      //log.info(`admin.sendInvitation`, fields.email);

      const defaultMessage = `To get started, simply click the link below. \n\n`;
      const salutation = fields.name ? `Hi ${fields.name},  \n\n` : "Hi there,  \n\n";
      const message = fields.message ? `${fields.message}\n\n${defaultMessage}` : `${defaultMessage}`;

      Accounts.emailTemplates.enrollAccount.text = (user, url) => {
        return `${salutation}${message}${url}`;
      };

      const exists = Accounts.findUserByEmail(fields.email);
      if (exists) {
        throw new Meteor.Error(`create-user not-authorized`, "Cannot create user - email address already in use.");
      }
      const id = Accounts.createUser({
        email: fields.email
      });

      //const userRoles = [];

      const userRoles = Object.keys(fields.roles).reduce((filtered, option) => {
        if (fields.roles[option]) {
          filtered.push(option);
        }
        return filtered;
      }, []);

      if (userRoles.length) {
        Roles.setUserRoles(id, userRoles);
      }

      //log.info(`admin.sendInvitation [${id}] [${salutation}${message}]`, fields.email, userRoles);

      //log.info(`admin.sendInvitation - account created`, id);

      Accounts.sendEnrollmentEmail(id);
    }
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
  validate: new SimpleSchema({
    userId: { type: String, optional: true }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("assignRolesNewUser", this.userId);
      let userRoles = ["user"];
      let email = Meteor.user().emails[0].address;
      if (email === Meteor.settings.private.adminEmail) {
        userRoles = ["user", "super-admin", "god"];
      }

      Roles.setUserRoles(this.userId, userRoles);
      log.info(`assignRolesNewUser - DONE`, email, userRoles);
      //Roles.addRolesToParent('USERS_VIEW', 'admin');
    }
    return true;
  }
});

export const deleteUserList = new ValidatedMethod({
  name: "admin.deleteUserList",
  validate: new SimpleSchema({
    selected: { type: Object, blackbox: true }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("deleteUser", this.userId, "admin");
      /*
      const idList = Object.keys(fields.selected).reduce((filtered, option) => {
        if (fields.selected[option]) {
          filtered.push(option);
        }
        return filtered;
      }, []);

      let funnyList = Object.keys(fields.selected).filter(id => {
        return fields.selected[id];
      });
*/
      const keys = Object.keys(fields.selected);
      let deletedList = [];
      log.info(`admin.deleteUserList`, keys);
      for (var i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        const val = fields.selected[key];

        if (val === true) {
          const prot = protectedUser(key, this.userId);
          if (!prot) {
            deletedList.push(key);
            deleteOne(key);
          }
        }
      }

      log.info(`Selected Users Deleted`, deletedList);
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
      const prot = protectedUser(fields.id, this.userId);
      if (prot) {
        throw new Meteor.Error(`deleteUser not-authorized`, "Cannot delete protected user.");
      }

      deleteOne(fields.id);
      /*
      const userProfileRecord = Profiles.findOne({ owner: fields.id });
      Images.remove(userProfileRecord._id, () => {});
      Meteor.users.remove(fields.id);
      Auth.remove({ owner: fields.id });
      userSessions.remove({ owner: fields.id });
      userSettings.remove({ owner: fields.id });
      Profiles.remove({ owner: fields.id });
*/
      log.info(`User Deleted`, fields.id);
    }
    return true;
  }
});

export const toggleRole = new ValidatedMethod({
  name: "admin.toggleRole",
  validate: new SimpleSchema({
    id: { type: String },
    role: { type: String }
  }).validator(),

  run(fields) {
    authCheck("toggleRole", this.userId, "admin");
    const current = Roles.userIsInRole(fields.id, fields.role);
    if (current) {
      Roles.removeUsersFromRoles(fields.id, fields.role);
    } else {
      Roles.addUsersToRoles(fields.id, fields.role);
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

      let rootAdmin: any;
      rootAdmin = Accounts.findUserByEmail(Meteor.settings.private.adminEmail);
      const excludeUsersExpression = [this.userId, rootAdmin._id];
      //const excludeUsersExpression = [{_id: this.userId}, {_id: rootAdmin._id}];

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

    console.log(`admin.deleteAllUsers -DONE!`);

    return true;
  }
});
