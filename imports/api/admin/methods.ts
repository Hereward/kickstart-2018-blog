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
import { Pages } from "../pages/publish";
import { Posts } from "../posts/publish";
import { ProfileImages } from "../images/methods";
import { can as userCan } from "../../modules/user";
import { systemSettings } from "./publish";
import { lockAccountToggle, insertNewSession, purgeAllOtherSessions } from "../sessions/methods";
import { sendVerificationEmail, newProfile } from "../profiles/methods";
import { insertAuth } from "../auth/methods";

let serverAuth: any;
if (Meteor.isServer) {
  serverAuth = require("../../server/auth");
}

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

const postsDataSrc = subscription => {
  switch (subscription) {
    case "posts":
      return Posts;
    case "pages":
      return Pages;
    default:
      return "";
  }
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

function deleteOneUser(id) {
  const userProfileRecord = Profiles.findOne({ owner: id });
  if (userProfileRecord) {
    ProfileImages.remove(userProfileRecord._id, () => {});
  }
  Meteor.users.remove(id);
  Auth.remove({ owner: id });
  userSessions.remove({ owner: id });
  userSettings.remove({ owner: id });
  Profiles.remove({ owner: id });
}

export const imageUpdatePostAdmin = new ValidatedMethod({
  name: "image.UpdatePostAdmin",
  validate: new SimpleSchema({
    id: { type: String, optional: true },
    image_id: { type: String }
  }).validator(),

  run(fields) {
    authCheck("admin.imageUpdatePost", this.userId, "admin");

    Posts.update(fields.id, {
      $set: {
        image_id: fields.image_id
      }
    });

    return true;
  }
});

export const imageUpdatePageAdmin = new ValidatedMethod({
  name: "image.UpdatePageAdmin",
  validate: new SimpleSchema({
    id: { type: String, optional: true },
    image_id: { type: String }
  }).validator(),

  run(fields) {
    authCheck("admin.imageUpdatePage", this.userId, "admin");

    Pages.update(fields.id, {
      $set: {
        image_id: fields.image_id
      }
    });

    return true;
  }
});

export const imageUpdateSettingsAdmin = new ValidatedMethod({
  name: "image.UpdateSettingsAdmin",
  validate: new SimpleSchema({
    id: { type: String, optional: true },
    image_id: { type: String }
  }).validator(),

  run(fields) {
    authCheck("admin.UpdateSettingsAdmin", this.userId, "admin");

    systemSettings.update(fields.id, {
      $set: {
        image_id: fields.image_id
      }
    });

    return true;
  }
});

export const adminToggle2FA = new ValidatedMethod({
  name: "admin.adminToggle2FA",

  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),

  run(fields) {
    authCheck("admin.adminToggle2FA", this.userId, "admin");
    if (!this.isSimulation) {
      let userId = fields.id;
      let settingsRecord: any;
      settingsRecord = userSettings.findOne({ owner: userId });

      if (settingsRecord) {
        userSessions.remove({ owner: userId });
        let currentState = settingsRecord.authEnabled;
        let targetState: number;
        switch (currentState) {
          case 1:
            targetState = 0;
            break;
          case 0:
            targetState = 3;
            break;
          case 2:
            targetState = 0;
            break;
          case 3:
            targetState = 0;
            break;
          default:
            targetState = 0;
        }

        userSettings.update(settingsRecord._id, { $set: { authEnabled: targetState } });

        if (targetState === 3) {
          let authRec: any;
          authRec = Auth.findOne({ owner: userId });
          serverAuth.initAuth(authRec._id, userId);
        }
      }
    }
  }
});

export const configureNewUser = new ValidatedMethod({
  name: "admin.configureNewUser",
  validate: new SimpleSchema({
    type: { type: String },
    userId: { type: String, optional: true },
    sessionToken: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("configureNewUser", this.userId);
      const allowMultiSession = Meteor.settings.public.session.allowMultiSession || false;

      const userId = fields.userId || this.userId;
      log.info(`configureNewUser [${userId}]`);
      //const userId = fields.userId;

      // USER SETTINGS
      let key: any;
      let secret: any;
      userSettings.remove({ owner: userId });

      const userSettingsId = userSettings.insert({
        authEnabled: 0,
        locked: false,
        owner: userId
      });

      // CREATE USER SESSION
      const sessionId = insertNewSession(userId, fields.sessionToken);

      // CREATE PROFILE
      const profileId = newProfile(userId);

      // ROLES
      if (fields.type === "register") {
        let userRoles = ["user"];
        const email = Meteor.user().emails[0].address;
        if (email === Meteor.settings.private.adminEmail) {
          userRoles = ["user", "super-admin", "god"];
        }

        Roles.setUserRoles(userId, userRoles);
      }

      // CREATE AUTH
      Auth.remove({ owner: userId });
      let authId = insertAuth(userId);

      sendVerificationEmail.call({ profileId: profileId, userId: userId }, (err, res) => {});

      if (!allowMultiSession) {
        Accounts.logoutOtherClients();
        purgeAllOtherSessions.call({ sessionToken: fields.sessionToken }, (err, res) => {});
      }
    }

    return true;
  }
});

export const updateSettings = new ValidatedMethod({
  name: "admin.updateSettings",
  validate: new SimpleSchema({
    title: { type: String },
    shortTitle: { type: String },
    copyright: { type: String },
    summary: { type: String },
    image_id: { type: String, optional: true }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("updateSettings", this.userId, "admin");

      systemSettings.update(
        { active: true },
        {
          $set: {
            title: fields.title,
            shortTitle: fields.shortTitle,
            copyright: fields.copyright,
            summary: fields.summary,
            image_id: fields.image_id || ""
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

      const userRoles = Object.keys(fields.roles).reduce((filtered, option) => {
        if (fields.roles[option]) {
          filtered.push(option);
        }
        return filtered;
      }, []);

      if (userRoles.length) {
        Roles.setUserRoles(id, userRoles);
      }

      Accounts.sendEnrollmentEmail(id);
    }
  }
});

export const toggleSystemOnline = new ValidatedMethod({
  name: "admin.toggleSystemOnline",

  validate: null,

  run(fields) {
    authCheck("toggleSystemOnline", this.userId, "admin");
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
            deleteOneUser(key);
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

      deleteOneUser(fields.id);

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
    let prot = false;

    if (!this.isSimulation) {
      prot = protectedUser(fields.id, this.userId);
    }

    if (!prot) {
      const current = Roles.userIsInRole(fields.id, fields.role);
      if (current) {
        Roles.removeUsersFromRoles(fields.id, fields.role);
      } else {
        Roles.addUsersToRoles(fields.id, fields.role);
      }
    }

    return true;
  }
});

export const deletePostList = new ValidatedMethod({
  name: "admin.deletePostList",
  validate: new SimpleSchema({
    selected: { type: Object, blackbox: true },
    subscription: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("deletePostList", this.userId, "admin");
      const dataSrc = postsDataSrc(fields.subscription);
      const keys = Object.keys(fields.selected);
      let deletedList = [];
      log.info(`admin.deletePostList`, keys);
      for (var i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        const val = fields.selected[key];
        if (val === true) {
          dataSrc.remove(key);
        }
      }

      log.info(`Selected Posts Deleted`, deletedList);
    }
    return true;
  }
});

/*
export const deletePageList = new ValidatedMethod({
  name: "admin.deletePageList",
  validate: new SimpleSchema({
    selected: { type: Object, blackbox: true },
    postsDataSrc: { type: Object, blackbox: true }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("deletePageList", this.userId, "admin");

      const keys = Object.keys(fields.selected);
      let deletedList = [];
      log.info(`admin.deletePageList`, keys);
      for (var i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        const val = fields.selected[key];

        if (val === true) {
          Pages.remove(key);
        }
      }

      log.info(`Selected Pages Deleted`, deletedList);
    }
    return true;
  }
});
*/

export const deleteAllPosts = new ValidatedMethod({
  name: "admin.deleteAllPosts",
  validate: new SimpleSchema({
    subscription: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("admin.deleteAllPosts", this.userId, "admin");
      const dataSrc = postsDataSrc(fields.subscription);
      dataSrc.remove({});
    }

    log.info(`admin.deleteAllPosts -DONE!`);

    return true;
  }
});

/*
export const deleteAllPages = new ValidatedMethod({
  name: "admin.deleteAllPages",
  validate: null,

  run(fields) {
    if (!this.isSimulation) {
      authCheck("admin.deleteAllPages", this.userId, "admin");
      Pages.remove({});
    }

    log.info(`admin.deleteAllPages -DONE!`);

    return true;
  }
});
*/

export const deleteAllUsers = new ValidatedMethod({
  name: "deleteAllUsers",
  validate: null,

  run(fields) {
    if (!this.isSimulation) {
      authCheck("admin.deleteAllUsers", this.userId, "admin");

      let rootAdmin: any;
      rootAdmin = Accounts.findUserByEmail(Meteor.settings.private.adminEmail);
      const excludeUsersExpression = [this.userId, rootAdmin._id];

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
      Auth.remove({ owner: { $nin: excludeUsersExpression } });
      userSessions.remove({ owner: { $nin: excludeUsersExpression } });
      userSettings.remove({ owner: { $nin: excludeUsersExpression } });
      Profiles.remove({ owner: { $nin: excludeUsersExpression } });

      let imagesCursor: any = ProfileImages.find({ _id: { $nin: excludeImagesExpression } });
      let imagesCount = imagesCursor.count();

      if (imagesCount) {
        const imagesArray = imagesCursor.fetch();
        log.info(`deleteAllUsers - image found! [${imagesCount}]`, imagesArray);
        ProfileImages.remove({ _id: { $nin: excludeImagesExpression } }, function remove(error) {
          if (error) {
            log.error("IMAGE File wasn't removed, error: " + error.reason);
          } else {
            log.info("IMAGE File successfully removed");
          }
        });
      }
    }

    log.info(`admin.deleteAllUsers -DONE!`);

    return true;
  }
});
