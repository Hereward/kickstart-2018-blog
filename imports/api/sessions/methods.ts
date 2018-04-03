///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { userSessions } from "./publish";

const authCheck = (userId, methodName) => {
  if (!userId) {
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
};

export const createUserSession = new ValidatedMethod({
  name: "UserSession.create",

  validate: null,

  run() {
    authCheck("UserSession.create", this.userId);
    let inactivityTimeout: any;
    inactivityTimeout = Meteor.settings.public.session.inactivityTimeout || 3600000;
    let now = new Date();
    let expires = new Date(Date.now() + inactivityTimeout);

    let id = "";

    userSessions.remove({ owner: this.userId });

    id = userSessions.insert({
      expired: false,
      active: true,
      expiresOn: expires,
      createdAt: now,
      owner: this.userId
    });

    console.log(`createUserSession`, id);

    return id;
  }
});


export const killSession = new ValidatedMethod({
  name: "UserSession.kill",
  validate: new SimpleSchema({
    id: { type: String },
    active: { type: Boolean }
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
            expired: true,
            active: fields.active
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
      console.log(`UserSession.keepAlive - activityDetected=[${fields.activityDetected}] id=[${fields.id}] diff=[${diff}]`);

      if (diff > 0) {
        killSession.call({ id: fields.id, active: true }, () => {});
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

export const destroySession = new ValidatedMethod({
  name: "session.destroy",
  validate: null,

  run(fields) {
    authCheck("session.destroy", this.userId);
    let ownerId = this.userId;
    userSessions.remove({ owner: ownerId });
    return true;
  }
});
