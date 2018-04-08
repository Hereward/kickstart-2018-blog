///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { userSessions } from "./publish";

const insert = function insert(userId) {
  let sessionRestored: boolean;
  let inactivityTimeout: any;
  inactivityTimeout = Meteor.settings.public.session.inactivityTimeout || 3600000;
  let now = new Date();
  let expires = new Date(Date.now() + inactivityTimeout);

  let id = userSessions.insert({
    expired: false,
    active: true,
    expiresOn: expires,
    createdAt: now,
    owner: userId
  });
  sessionRestored = true;

  return id;
};

const authCheck = (userId, methodName) => {
  if (!userId) {
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
};

export const createUserSession = new ValidatedMethod({
  name: "UserSession.create",

  validate: null,

  run() {
    console.log("createUserSession");
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
    authCheck("session.kill", this.userId);
    let sessionRecord: any;

    sessionRecord = userSessions.findOne({ owner: fields.id });
    if (sessionRecord) {
      console.log(`UserSession.kill - KILL NOW`, fields.id);
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
      console.log(`UserSession.deActivateSession`);
      userSessions.update(
        { owner: this.userId },
        {
          $set: {
            active: false,
            expired: false
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
    activityDetected: { type: Boolean }
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
      let diff = now - sessionRecord.expiresOn;
      console.log(
        `UserSession.keepAlive - activityDetected=[${fields.activityDetected}] id=[${fields.id}] diff=[${diff}]`
      );

      if (diff > 0) {
        killSession.call({ id: fields.id }, () => {});
      } else if (fields.activityDetected) {
        let expires = new Date(Date.now() + inactivityTimeout);
        userSessions.update(
          { owner: fields.id },
          {
            $set: {
              expiresOn: expires
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

  validate: null,

  run() {
    let sessionRestored = false;
    let id: string;

    if (!this.isSimulation) {
      authCheck("UserSession.restore", this.userId);
      console.log(`restoreUserSession`);
      let sessionRecord = userSessions.findOne({ owner: this.userId });

      if (!sessionRecord) {
        console.log(`insert: no session found for user: [${this.userId}]`);
        id = insert(this.userId);
        sessionRestored = true;
      } else {
        keepAliveUserSession.call({ id: this.userId, activityDetected: false }, (err, res) => {
          if (err) {
            console.log(`keepAliveUserSession error`, err.reason);
          }
        });
      }
      console.log(`restoreUserSession sessionRestored=[${sessionRestored}] id=[${id}]`);
    }
    return sessionRestored;
  }
});

export const destroySession = new ValidatedMethod({
  name: "session.destroy",
  validate: null,

  run(fields) {
    authCheck("session.destroy", this.userId);
    console.log(`destroySession`, this.userId);
    let ownerId = this.userId;
    userSessions.remove({ owner: ownerId });
    return true;
  }
});
