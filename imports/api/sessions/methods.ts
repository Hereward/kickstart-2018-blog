///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { userSessions } from "./publish";
import { userSettings } from "../settings/publish";
import { Auth } from "../auth/publish";

const authCheck = (methodName, userId) => {
  let auth = true;
  if (!userId) {
    auth = false;
    console.log(`authCheck (${methodName}) - NO USER ID`);
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
  return auth;
};

const sessionCheck = (sessionRecord = "", loginToken = "") => {
  if (!sessionRecord) {
    log.error(`updateAuth - invalidSession`, loginToken);
    throw new Meteor.Error(`invalidSession`, "It appears you are logged out (no session). Please try again!");
  }
};

export const getSession = function getSession(userId, token = "") {
  let sessionRecord: any = userSessions.findOne({ owner: userId, loginToken: token });
  return sessionRecord;
};

export const clearSessionAuth = (userId, loginToken) => {
  let sessionRecord: any;
  sessionRecord = userSessions.findOne({ owner: userId, loginToken: loginToken });

  userSessions.update({ owner: userId, loginToken: loginToken }, { $unset: { auth: 1 } });
};

const insert = function insert(userId, token = "") {
  let inactivityTimeout: any;
  let removeOptions = {};
  inactivityTimeout = Meteor.settings.public.session.inactivityTimeout || 3600000;
  let now: any;
  now = new Date();
  let expires: any;
  expires = new Date(Date.now() + inactivityTimeout);

  userSessions.remove({ loginToken: token });

  //  auth: {verified: 2, currentAttempts: 0},

  let id = userSessions.insert({
    loginToken: token,
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

  validate: new SimpleSchema({
    loginToken: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("UserSession.create", this.userId);
      //let authRecord: any;

      let sessionId = insert(this.userId, fields.loginToken);
      //authRecord = Auth.findOne({ owner: this.userId, sessionId: sessionId });
      let settings: any;

      /*
      settings = userSettings.findOne({ owner: this.userId });

      if (settings.authEnabled > 0) {
        insertAuth(sessionId, this.userId);
      }
      */

      log.info(`createUserSession`, fields, sessionId);
    }
  }
});

export const clearSessionAuthMethod = new ValidatedMethod({
  name: "UserSession.clearSessionAuthMethod",

  validate: new SimpleSchema({
    loginToken: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("UserSession.clearSessionAuthMethod", this.userId);
      clearSessionAuth(this.userId, fields.loginToken);
    }
  }
});

/*
export const restoreUserSession = new ValidatedMethod({
  name: "UserSession.restore",

  validate: new SimpleSchema({
    loginToken: { type: String }
  }).validator(),

  run(fields) {
    let sessionRestored = false;
    let id: string;

    if (!this.isSimulation) {
      let authorised = authCheck("UserSession.restore", this.userId);
      id = insert(this.userId, fields.loginToken);
      sessionRestored = true;
    }

    log.info(`restoreUserSession sessionRestored=[${sessionRestored}]`, fields, id);

    return sessionRestored;
  }
});
*/

export const restoreUserSession = new ValidatedMethod({
  name: "UserSession.restore",

  validate: new SimpleSchema({
    loginToken: { type: String }
  }).validator(),

  run(fields) {
    let sessionRestored = false;
    let id: string;

    if (!this.isSimulation) {
      let authorised = authCheck("UserSession.restore", this.userId);

      let sessionRecord = userSessions.findOne({ owner: this.userId, loginToken: fields.loginToken });
      if (!sessionRecord) {
        id = insert(this.userId, fields.loginToken);
        //insertAuth(id);
        sessionRestored = true;
      } else {
        keepAliveUserSession.call({ activityDetected: false, loginToken: fields.loginToken }, (err, res) => {
          if (err) {
            console.log(`keepAliveUserSession error`, err.reason);
          }
        });
      }
      log.info(`restoreUserSession sessionRestored=[${sessionRestored}]`, fields, id);
    }

    return sessionRestored;
  }
});

export const exceedAttemptsCheck = (verified, attemptsLeft) => {
  let message: string;
  if (attemptsLeft < 1 && !verified) {
    message =
      "You have exceeded the maximum allowed number of authentication attempts. Please contact Admin to reinstate access to your account.";
    throw new Meteor.Error(`exceededAttempts`, message);
  } else if (!verified && attemptsLeft > 0) {
    let attempts = attemptsLeft > 1 ? "attempts" : "attempt";
    message = `You have ${attemptsLeft} ${attempts} left.`;
    throw new Meteor.Error(`invalidCode`, message);
  } else {
    return true;
  }
};

export const updateAuth = (userId, loginToken, verified) => {
  //let verified = false;
  let targetState: number;
  let operationType: string;
  //let ownerId = this.userId;
  let settingsRecord: any;
  let sessionRecord: any;
  let currentAttempts = 0;

  let maxAttempts = Meteor.settings.public.enhancedAuth.maxAttempts;
  let attemptsLeft = maxAttempts;
  //let verifiedInt = verified ? 1 : 0;

  sessionRecord = getSession(userId, loginToken);
  sessionCheck(sessionRecord, loginToken);

  if (!verified) {
    currentAttempts = sessionRecord.auth.currentAttempts + 1;
    attemptsLeft = maxAttempts - (sessionRecord.auth.currentAttempts + 1);
  }

  userSessions.update(sessionRecord._id, { $set: { auth: { verified: verified, currentAttempts: currentAttempts } } });

  let attemptsOK = exceedAttemptsCheck(verified, attemptsLeft);
  let settings: any;
  settings = userSettings.findOne({ owner: userId });

  if (attemptsOK) {
    let currentState = settings.authEnabled;
    switch (currentState) {
      case 1:
        targetState = 1;
        break;
      case 0:
        targetState = 0;
        break;
      case 2:
        targetState = 0;
        operationType = "disabled";
        break;
      case 3:
        targetState = 1;
        operationType = "enabled";
        break;
      default:
        targetState = 0;
    }

    userSettings.update(settings._id, {
      $set: { authEnabled: targetState }
    });
  }

  return operationType;
};

/*
export const setVerified = new ValidatedMethod({
  name: "sessions.setVerified",

  validate: new SimpleSchema({
    loginToken: { type: String },
    verified: { type: Boolean }
  }).validator(),

  run(fields) {
    authCheck("sessions.setVerified", this.userId);
    let ownerId = this.userId;
    let sessionRecord: any;
    sessionRecord = getSession(this.userId, fields.loginToken);
    sessionCheck(sessionRecord, fields.loginToken);

    if (sessionRecord) {
      userSessions.update(sessionRecord._id, { $set: { "auth.verified": fields.verified } });
      console.log(`sessions.setVerified - DONE!`);
    } else {
      console.log(`sessions.setVerified - No auth record found.`);
    }
  }
});
*/

export const killSession = new ValidatedMethod({
  name: "UserSession.kill",
  validate: new SimpleSchema({
    loginToken: { type: String },
    id: { type: String }
  }).validator(),

  run(fields) {
    authCheck("session.kill", fields.id);
    let sessionRecord: any;

    sessionRecord = getSession(fields.id, fields.loginToken);
    sessionCheck(sessionRecord, fields.loginToken);

    if (sessionRecord) {
      userSessions.update(
        { owner: fields.id, loginToken: fields.loginToken },
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

  validate: new SimpleSchema({
    loginToken: { type: String }
  }).validator(),
  run(fields) {
    authCheck("session.deActivate", this.userId);
    let sessionRecord: any;
    sessionRecord = userSessions.findOne({ owner: this.userId, loginToken: fields.loginToken });
    sessionCheck(sessionRecord, fields.loginToken);

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
    loginToken: { type: String },
    activityDetected: { type: Boolean },
    force: { type: Boolean, optional: true }
  }).validator(),

  run(fields) {
    authCheck("UserSession.keepAlive", this.userId);
    let inactivityTimeout: any;
    inactivityTimeout = Meteor.settings.public.session.inactivityTimeout || 3600000;
    let now: any;
    now = new Date();
    let id = "";
    let sessionRecord: any;
    sessionRecord = userSessions.findOne({ owner: this.userId, loginToken: fields.loginToken });
    sessionCheck(sessionRecord, fields.loginToken);

    if (sessionRecord) {
      let diff = sessionRecord.expiresOn - now;

      if (diff < 0 && !fields.force) {
        killSession.call({ id: this.userId, loginToken: fields.loginToken }, () => {});
      } else if (fields.activityDetected) {
        let expires = new Date(Date.now() + inactivityTimeout);
        // Date.now()
        userSessions.update(
          { owner: this.userId, loginToken: fields.loginToken },
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

export const purgeSessions = new ValidatedMethod({
  name: "session.destroy",
  validate: null,

  run() {
    authCheck("session.destroy", this.userId);
    //let sessionRecords = userSessions.find({ active: false }).fetch();
    //if (sessionRecords) {
    userSessions.remove({ active: false });
    //}

    return true;
  }
});
