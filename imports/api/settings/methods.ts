///<reference path="../../../index.d.ts"/>
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { userSessions } from "../sessions/publish";
import { userSettings } from "./publish";
import { Auth } from "../auth/publish";
import { insertAuth, initAuth } from "../auth/methods";
import { clearSessionAuth, getSession } from "../sessions/methods";

//let Future: any;
//let QRCode: any;
//let speakeasy = require("speakeasy");

//declare var Npm: any;

//let crypto = require("crypto");

const authCheck = (methodName, userId) => {
  let auth = true;
  if (!userId) {
    auth = false;
    console.log(`authCheck (${methodName}) - NO USER ID`);
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

        if (targetState === 2) {
          //let session: any;
          //session = getSession(this.userId, fields.sessionToken);
          clearSessionAuth(this.userId, fields.sessionToken);
        }

        //let id = insertAuth(this.userId);
        if (targetState === 3) {
          let authRec: any;
          authRec = Auth.findOne({ owner: this.userId });
          initAuth(authRec._id, this.userId);
        }

        console.log(`userSettings.toggleEnabledPending - DONE!`, currentState, targetState);
      } else {
        console.log(`userSettings.toggleEnabledPending - No record found.`);
      }
    }
  }
});

export const cancel2FA = new ValidatedMethod({
  name: "auth.cancel",

  validate: null,

  run(fields) {
    authCheck("settings.cancel2FA", this.userId);
    if (!this.isSimulation) {
      let settingsRecord: any;
      //authRecord = Auth.findOne({ owner: this.userId });
      settingsRecord = userSettings.findOne({ owner: this.userId });
      if (settingsRecord) {
        userSettings.update(settingsRecord._id, { $set: { authEnabled: 0 } });
        console.log(`auth.cancel - DONE!`);
      }
    }
  }
});

/*
export const cleanup = new ValidatedMethod({
  name: "settings.cleanup",

  validate: null,

  run(fields) {
    authCheck("settings.cleanup", this.userId);
    let targetState: number;
    let ownerId = this.userId;
    let logOutRequired: boolean = false;
    if (!this.isSimulation) {
      let SettingsRecord: any;
      SettingsRecord = Settings.findOne({ owner: ownerId });

      if (SettingsRecord) {
        let currentState = SettingsRecord.enabled;
        switch (currentState) {
          case 1:
            targetState = 1;
            break;
          case 0:
            targetState = 0;
            break;
          case 2:
            targetState = 1;
            break;
          case 3:
            targetState = 0;
            break;
          default:
            targetState = 0;
        }


        Settings.update(SettingsRecord._id, {
          $set: { enabled: targetState }
        });

        console.log(`settings.cleanup - DONE!`);
      } else {
        console.log(`settings.cleanup - No record found.`);
      }
    }
    return logOutRequired;
  }
});

*/
