///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { userSessions } from "./publish";

const authCheck = (userId, methodName) => {
  //console.log("authCheck", userId, methodName);
  if (!userId) {
    console.log("authCheck failed", methodName);
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
};

const insert = function insert(userId) {
  let sessionRestored: boolean;
  let inactivityTimeout: any;
  inactivityTimeout = Meteor.settings.public.session.inactivityTimeout || 3600000;
  let now = new Date();
  let expires = new Date(Date.now() + inactivityTimeout);

  userSessions.remove({ owner: userId });

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
    authCheck("session.kill", fields.id);
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
      let diff = now - sessionRecord.expiresOn;
      console.log(
        `UserSession.keepAlive - force=[${fields.force}] activityDetected=[${fields.activityDetected}] id=[${
          fields.id
        }] diff=[${diff}]`
      );

      if (diff > 0 && !fields.force) {
        killSession.call({ id: fields.id }, () => {});
      } else if (fields.activityDetected) {
        let expires = new Date(Date.now() + inactivityTimeout);
        // Date.now()
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

  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),

  run(fields) {
    let sessionRestored = false;
    let id: string;
    authCheck("UserSession.restore", fields.id);

    //if (!this.isSimulation) {
    //let auth = authCheck("UserSession.restore", fields.id);
    console.log(`restoreUserSession`, fields.id);
    let sessionRecord = userSessions.findOne({ owner: fields.id });

    // killSession.call({ id: fields.id }, () => {});
    //if (this.userId) {
    //console.log(`restoreUserSession THIS.userId is ALIVE!!! [${this.userId}]`);
    if (!sessionRecord) {
      console.log(`restoreUserSession: no session found for user: [${fields.id}]`);
      id = insert(fields.id);
      sessionRestored = true;
    } else {
      keepAliveUserSession.call({ id: fields.id, activityDetected: false }, (err, res) => {
        if (err) {
          console.log(`keepAliveUserSession error`, err.reason);
        }
      });
    }
    //}

    console.log(`restoreUserSession userID=[${fields.id}] sessionRestored=[${sessionRestored}] id=[${id}]`);
    return sessionRestored;
  }
});

export const destroySession = new ValidatedMethod({
  name: "session.destroy",
  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),

  run(fields) {
    authCheck("session.destroy", fields.id);
    let sessionRecord = userSessions.findOne({ owner: fields.id });
    if (sessionRecord) {
      console.log(`destroySession`, fields.id);
      userSessions.remove({ owner: fields.id });
    }

    return true;
  }
});
