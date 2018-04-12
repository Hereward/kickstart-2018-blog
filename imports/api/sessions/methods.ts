///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { userSessions } from "./publish";

const authCheck = (methodName, userId) => {
  let auth = true;
  if (!userId) {
    auth = false;
    console.log(`authCheck (${methodName}) - NO USER ID`);
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
  return auth;
};

const insert = function insert(userId) {
  let inactivityTimeout: any;
  let removeOptions = {};
  inactivityTimeout = Meteor.settings.public.session.inactivityTimeout || 3600000;
  let now: any;
  now = new Date();
  let expires: any;
  expires = new Date(Date.now() + inactivityTimeout);

  userSessions.remove({ owner: userId });

  let id = userSessions.insert({
    expired: false,
    active: true,
    expiresOn: expires,
    createdAt: now,
    owner: userId
  });

  return id;
};

export const createUserSession = new ValidatedMethod({
  name: "UserSession.create",

  validate: null,

  run() {
    authCheck("UserSession.create", this.userId);
    let id = insert(this.userId);
  }
});

export const killSession = new ValidatedMethod({
  name: "UserSession.kill",
  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),

  run(fields) {
    authCheck("session.kill", fields.id);
    let sessionRecord: any;

    sessionRecord = userSessions.findOne({ owner: fields.id });
    if (sessionRecord) {
      userSessions.update(
        { owner: fields.id },
        {
          $set: {
            expired: true
          }
        }
      );
    }

    return true;
  }
});

export const deActivateSession = new ValidatedMethod({
  name: "UserSession.deActivate",

  validate: null,

  run() {
    authCheck("session.deActivate", this.userId);
    let sessionRecord: any;
    sessionRecord = userSessions.findOne({ owner: this.userId });
    if (sessionRecord) {
      userSessions.update(
        { owner: this.userId },
        {
          $set: {
            active: false
          }
        }
      );
    }
    return true;
  }
});

export const keepAliveUserSession = new ValidatedMethod({
  name: "UserSession.keepAlive",

  validate: new SimpleSchema({
    id: { type: String },
    activityDetected: { type: Boolean },
    force: { type: Boolean, optional: true }
  }).validator(),

  run(fields) {
    authCheck("UserSession.keepAlive", fields.id);
    let inactivityTimeout: any;
    inactivityTimeout = Meteor.settings.public.session.inactivityTimeout || 3600000;
    let now: any;
    now = new Date();
    let id = "";
    let sessionRecord: any;
    sessionRecord = userSessions.findOne({ owner: fields.id });

    if (sessionRecord) {
      let diff = sessionRecord.expiresOn - now;

      if (diff < 0 && !fields.force) {
        killSession.call({ id: fields.id }, () => {});
      } else if (fields.activityDetected) {
        let expires = new Date(Date.now() + inactivityTimeout);
        // Date.now()
        userSessions.update(
          { owner: fields.id },
          {
            $set: {
              expiresOn: expires,
              diff: diff
            }
          }
        );
      }
    }

    return id;
  }
});

export const restoreUserSession = new ValidatedMethod({
  name: "UserSession.restore",

  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),

  run(fields) {
    let sessionRestored = false;
    let id: string;
    let authorised = authCheck("UserSession.restore", this.userId);

    if (authorised && !this.isSimulation) {
      let sessionRecord = userSessions.findOne({ owner: this.userId });

      if (!sessionRecord) {
        id = insert(this.userId);
        sessionRestored = true;
      } else {
        keepAliveUserSession.call({ id: this.userId, activityDetected: false }, (err, res) => {
          if (err) {
            console.log(`keepAliveUserSession error`, err.reason);
          }
        });
      }
    }

    return sessionRestored;
  }
});

export const destroySession = new ValidatedMethod({
  name: "session.destroy",
  validate: null,

  run() {
    authCheck("session.destroy", this.userId);
    let sessionRecord = userSessions.findOne({ owner: this.userId });
    if (sessionRecord) {
      userSessions.remove({ owner: this.userId });
    }

    return true;
  }
});
