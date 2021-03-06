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
import { AvatarImages } from "../images/methods";
import { can as userCan } from "../../modules/user";
import { systemSettings } from "./publish";
import { Comments } from "../comments/publish";
import { Tags } from "../tags/publish";
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

const postsDataSrc = contentType => {
  switch (contentType) {
    case "posts":
      return Posts;
    case "pages":
      return Pages;
    case "comments":
      return Comments;
    case "tags":
      return Tags;
    default:
      return "";
  }
};

const protectedUser = (targetId: string, userId: string, action: string, role?: string) => {
  let status = true;
  const rootAdminObj = Accounts.findUserByEmail(Meteor.settings.private.adminEmail);
  const selfEdit = targetId === userId;
  const rootId = rootAdminObj ? rootAdminObj._id : "";
  const protectedTarget =
    (selfEdit || targetId === rootId) && (action === "delete" || role === "god" || role === "banned");
  const superAdmin = Roles.userIsInRole(userId, ["super-admin"]);
  const rootAdmin = rootId === userId;
  const god = Roles.userIsInRole(userId, ["god"]);
  const admin = Roles.userIsInRole(userId, ["admin"]);
  const targetUserElevated = Roles.userIsInRole(targetId, ["god", "super-admin", "admin"]);
  const thisUserElevated = Roles.userIsInRole(userId, ["god", "super-admin", "admin"]);

  if (!protectedTarget) {
    if (targetUserElevated && action === "changeRole" && role === "banned") {
      status = true;
    } else if (rootAdmin && action === "changeRole") {
      status = false;
    } else if (god && action === "changeRole" && role !== "god") {
      status = false;
    } else if (superAdmin && action === "changeRole" && role !== "god" && role !== "super-admin") {
      status = false;
    } else if (admin && action === "changeRole" && role !== "god" && role !== "super-admin" && role !== "admin") {
      status = false;
    } else if (!targetUserElevated && thisUserElevated && action === "delete") {
      status = false;
    }
  }

  return status;
};

function deleteOneUser(id) {
  const userProfileRecord = Profiles.findOne({ owner: id });
  if (userProfileRecord) {
    AvatarImages.remove(userProfileRecord._id, () => {});
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
    authCheck("admin.imageUpdatePost", this.userId, "creator");

    Posts.update(fields.id, {
      $set: {
        image_id: fields.image_id
      }
    });

    return true;
  }
});

export const updateCommentAdmin = new ValidatedMethod({
  name: "comment.updateAdmin",
  validate: new SimpleSchema({
    id: { type: String },
    publish: { type: Boolean },
    postId: { type: String },
    parentId: { type: String, optional: true },
    body: { type: String }
  }).validator(),

  run(fields) {
    authCheck("comment.updateAdmin", this.userId, "admin");
    const current = Comments.findOne(fields.id);
    Comments.update(fields.id, {
      $set: {
        postId: fields.postId,
        publish: fields.publish,
        parentId: fields.parentId || current.parentId,
        body: fields.body,
        modified: new Date()
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
    authCheck("admin.imageUpdatePage", this.userId, "creator");

    Pages.update(fields.id, {
      $set: {
        image_id: fields.image_id
      }
    });

    return true;
  }
});

/*
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
*/

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
      for (var i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        const val = fields.selected[key];

        if (val === true) {
          const prot = protectedUser(key, this.userId, "delete");
          if (!prot) {
            deletedList.push(key);
            deleteOneUser(key);
          }
        }
      }
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
      const prot = protectedUser(fields.id, this.userId, "delete");
      if (prot) {
        throw new Meteor.Error(`deleteUser not-authorized`, "Cannot delete protected user.");
      }

      deleteOneUser(fields.id);
    }
    return true;
  }
});

export const toggleRole = new ValidatedMethod({
  name: "admin.toggleRole",
  validate: new SimpleSchema({
    targetId: { type: String },
    role: { type: String }
  }).validator(),

  run(fields) {
    authCheck("toggleRole", this.userId, "admin");
    let prot = false;

    if (!this.isSimulation) {
      prot = protectedUser(fields.targetId, this.userId, "changeRole", fields.role);
    }

    if (!prot) {
      const current = Roles.userIsInRole(fields.targetId, fields.role);
      if (current) {
        Roles.removeUsersFromRoles(fields.targetId, fields.role);
      } else {
        Roles.addUsersToRoles(fields.targetId, fields.role);
      }
    }

    return true;
  }
});

export const publishPostList = new ValidatedMethod({
  name: "admin.publishPostList",
  validate: new SimpleSchema({
    selected: { type: Object, blackbox: true },
    contentType: { type: String },
    publish: { type: Boolean }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("publishPostList", this.userId, "admin");
      const dataSrc = postsDataSrc(fields.contentType);
      const keys = Object.keys(fields.selected);
      let publishList = [];
      for (var i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        const val = fields.selected[key];
        if (val === true) {
          dataSrc.update(key, {
            $set: {
              publish: fields.publish
            }
          });
        }
      }
    }
    return true;
  }
});

export const deletePostList = new ValidatedMethod({
  name: "admin.deletePostList",
  validate: new SimpleSchema({
    selected: { type: Object, blackbox: true },
    contentType: { type: String },
    deleteComments: { type: Boolean, optional: true }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("deletePostList", this.userId, "admin");
      const dataSrc = postsDataSrc(fields.contentType);
      const keys = Object.keys(fields.selected);
      let deletedList = [];
      for (var i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        const val = fields.selected[key];
        if (val === true) {
          dataSrc.remove(key);
          if (fields.deleteComments) {
            Comments.remove({ postId: key });
          }
        }
      }
    }
    return true;
  }
});

export const deleteAllPosts = new ValidatedMethod({
  name: "admin.deleteAllPosts",
  validate: new SimpleSchema({
    contentType: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("admin.deleteAllPosts", this.userId, "admin");
      const dataSrc = postsDataSrc(fields.contentType);
      dataSrc.remove({});
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

      let excludeImagesExpression = [];
      let userProfileRecord: any;
      userProfileRecord = Profiles.findOne({ owner: this.userId });
      let userImageId = userProfileRecord.image_id;

      if (userImageId) {
        excludeImagesExpression.push(userImageId);
      }

      let adminProfileRecord: any;
      adminProfileRecord = Profiles.findOne({ owner: rootAdmin._id });
      let adminImageId = adminProfileRecord.image_id;

      if (adminImageId) {
        excludeImagesExpression.push(adminImageId);
      }

      Meteor.users.remove({ _id: { $nin: excludeUsersExpression } });
      Auth.remove({ owner: { $nin: excludeUsersExpression } });
      userSessions.remove({ owner: { $nin: excludeUsersExpression } });
      userSettings.remove({ owner: { $nin: excludeUsersExpression } });
      Profiles.remove({ owner: { $nin: excludeUsersExpression } });

      let avatarsCursor: any = AvatarImages.find({ _id: { $nin: excludeImagesExpression } });
      let avatarsCount = avatarsCursor.count();

      if (avatarsCount) {
        const imagesArray = avatarsCursor.fetch();
        AvatarImages.remove({ _id: { $nin: excludeImagesExpression } }, function remove(error) {
          if (error) {
            log.error("IMAGE File wasn't removed, error: " + error.reason);
          }
        });
      }
    }

    return true;
  }
});
