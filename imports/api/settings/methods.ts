///<reference path="../../../index.d.ts"/>
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { userSessions } from "../sessions/publish";
import { userSettings } from "./publish";
import { Auth } from "../auth/publish";
import { insertAuth, initAuth } from "../auth/methods";
import { clearSessionAuth, initSessionAuthVerified, getSession, cancel2FASession } from "../sessions/methods";

const authCheck = (methodName, userId) => {
  let auth = true;
  if (!userId) {
    auth = false;
    log.info(`authCheck (${methodName}) - NO USER ID`);
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
  return auth;
};

export const createUserSettings = new ValidatedMethod({
  name: "userSettings.create",

  validate: null,

  run() {
    authCheck("userSettings.create", this.userId);
    let key: any;
    let secret: any;
    userSettings.remove({ owner: this.userId });

    let authId = userSettings.insert({
      authEnabled: 0,
      locked: false,
      owner: this.userId
    });

    return authId;
  }
});

export const toggleAuthEnabledPending = new ValidatedMethod({
  name: "userSettings.toggleEnabledPending",

  validate: new SimpleSchema({
    sessionToken: { type: String }
  }).validator(),

  run(fields) {
    authCheck("userSettings.toggleEnabledPending", this.userId);
    if (!this.isSimulation) {
      let ownerId = this.userId;
      let settingsRecord: any;
      settingsRecord = userSettings.findOne({ owner: ownerId });

      if (settingsRecord) {
        let currentState = settingsRecord.authEnabled;
        let targetState: number;
        switch (currentState) {
          case 1:
            targetState = 2;
            break;
          case 0:
            targetState = 3;
            break;
          case 2:
            targetState = 2;
            break;
          case 3:
            targetState = 3;
            break;
          default:
            targetState = 0;
        }

        if (targetState > 1) {
          userSettings.update(settingsRecord._id, { $set: { authEnabled: targetState } });
        }

        if (targetState === 3) {
          let authRec: any;
          authRec = Auth.findOne({ owner: this.userId });
          initAuth(authRec._id, this.userId);
        }
      }
    }
  }
});

export const cancel2FA = new ValidatedMethod({
  name: "auth.cancel",

  validate: new SimpleSchema({
    sessionToken: { type: String }
  }).validator(),

  run(fields) {
    authCheck("settings.cancel2FA", this.userId);
    if (!this.isSimulation && this.userId) {
      let settingsRecord: any;
      let targetauthEnabledVal: number;
      settingsRecord = userSettings.findOne({ owner: this.userId });
      if (settingsRecord) {
        cancel2FASession(this.userId, fields.sessionToken, settingsRecord.authEnabled);
        targetauthEnabledVal = settingsRecord.authEnabled === 3 ? 0 : 1;
        userSettings.update(settingsRecord._id, { $set: { authEnabled: targetauthEnabledVal } });
      }
    }
  }
});
