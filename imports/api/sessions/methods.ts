///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { userSessions } from "./publish";
import { userSettings } from "../settings/publish";
import { Auth } from "../auth/publish";
import { hash } from "../../modules/user";

const authCheck = (methodName, userId) => {
  let auth = true;
  if (!userId) {
    auth = false;
    console.log(`authCheck (${methodName}) - NO USER ID`);
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
  return auth;
};

const sessionCheck = (methodName, sessionRecord = "", sessionToken = "") => {
  if (!sessionRecord) {
    log.error(`${methodName} - invalidSession`, sessionToken);
    throw new Meteor.Error(`invalidSession`, "It appears you are logged out (no session). Please try again!");
  }
};

export const getSession = function getSession(userId, token = "") {
  let sessionRecord: any;
  let hashedToken = hash(token);
  sessionRecord = userSessions.findOne({ owner: userId, sessionToken: hashedToken, active: true });
  return sessionRecord;
};

export const clearSessionAuth = (userId, sessionToken) => {
  let sessionRecord: any;
  sessionRecord = getSession(userId, sessionToken);
  if (sessionRecord && sessionRecord.auth) {
    userSessions.update(sessionRecord._id, { $unset: { auth: 1 } });
  }
};

export const initSessionAuthVerified = (userId, sessionToken) => {
  let sessionRecord: any;
  let sessionRecordUpdated: any;
  sessionRecord = getSession(userId, sessionToken);

  if (sessionRecord && sessionRecord.auth) {
    userSessions.update(sessionRecord._id, { $set: { "auth.verified": false } });
  } else if (sessionRecord) {
    userSessions.update(sessionRecord._id, { $set: { auth: { verified: false, currentAttempts: 0 } } });
  }
  sessionRecordUpdated = userSessions.findOne(sessionRecord._id);
  return sessionRecordUpdated;
};

const insert = function insert(userId, token = "") {
  let inactivityTimeout: any;
  let removeOptions = {};
  inactivityTimeout = Meteor.settings.public.session.inactivityTimeout || 3600000;
  let now: any;
  now = new Date();
  let expires: any;
  expires = new Date(Date.now() + inactivityTimeout);
  let hashedToken = hash(token);

  userSessions.remove({ sessionToken: hashedToken });

  let id = userSessions.insert({
    sessionToken: hashedToken,
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
    sessionToken: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("UserSession.create", this.userId);

      let sessionId = insert(this.userId, fields.sessionToken);
      let settings: any;
    }
  }
});

export const clearSessionAuthMethod = new ValidatedMethod({
  name: "UserSession.clearSessionAuthMethod",

  validate: new SimpleSchema({
    sessionToken: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("UserSession.clearSessionAuthMethod", this.userId);
      clearSessionAuth(this.userId, fields.sessionToken);
    }
  }
});

export const restoreUserSession = new ValidatedMethod({
  name: "UserSession.restore",

  validate: new SimpleSchema({
    sessionToken: { type: String }
  }).validator(),

  run(fields) {
    let sessionRestored = false;
    let id: string;

    if (!this.isSimulation) {
      let sessionRecord: any;
      if (this.userId && fields.sessionToken) {
        sessionRecord = getSession(this.userId, fields.sessionToken);
      }

      if (this.userId && fields.sessionToken && !sessionRecord) {
        id = insert(this.userId, fields.sessionToken);
        sessionRestored = true;
      }
      log.info(`restoreUserSession userId=[${this.userId}] sessionRestored=[${sessionRestored}]`, fields, id);
    }

    return sessionRestored;
  }
});

export const exceedAttemptsCheck = (verified, attemptsLeft) => {
  let message: string;
  let recalctAttempts = attemptsLeft - 1;
  if ((attemptsLeft < 2 && !verified) || attemptsLeft < 1) {
    message =
      "You have exceeded the maximum allowed number of authentication attempts. Please contact Admin to reinstate access to your account.";
    throw new Meteor.Error(`exceededAttempts`, message);
  } else if (!verified && attemptsLeft > 0) {
    let attemptsLabel = attemptsLeft > 1 ? "attempts" : "attempt";

    message = `You have ${recalctAttempts} ${attemptsLabel} left.`;
    throw new Meteor.Error(`invalidCode`, message);
  } else {
    return true;
  }
};

export const updateAuth = (userId, sessionToken, verified) => {
  let targetState: number;
  let operationType: string;
  let settingsRecord: any;
  let sessionRecord: any;
  let currentAttempts = 0;
  let attemptsLeft: number;
  let maxAttempts = Meteor.settings.public.enhancedAuth.maxAttempts;

  sessionRecord = initSessionAuthVerified(userId, sessionToken);
  sessionCheck("updateAuth", sessionRecord, sessionToken);
  attemptsLeft = maxAttempts - sessionRecord.auth.currentAttempts;
  currentAttempts = sessionRecord.auth.currentAttempts + 1;
  userSessions.update(sessionRecord._id, {
    $set: { "auth.currentAttempts": currentAttempts }
  });

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

    userSessions.update(sessionRecord._id, {
      $set: { "auth.verified": verified }
    });

    if (verified) {
      userSessions.update(sessionRecord._id, {
        $set: { "auth.currentAttempts": 0 }
      });
      userSettings.update(settings._id, {
        $set: { authEnabled: targetState }
      });
    }
  }

  return operationType;
};

export const killSession = new ValidatedMethod({
  name: "UserSession.kill",
  validate: new SimpleSchema({
    sessionToken: { type: String },
    id: { type: String }
  }).validator(),

  run(fields) {
    authCheck("session.kill", fields.id);
    let sessionRecord: any;

    sessionRecord = getSession(fields.id, fields.sessionToken);
    sessionCheck("killSession", sessionRecord, fields.sessionToken);

    if (sessionRecord) {
      userSessions.update(sessionRecord._id, {
        $set: {
          expired: true
        }
      });
    }

    return true;
  }
});

export const destroySession = new ValidatedMethod({
  name: "UserSession.destroySession",

  validate: new SimpleSchema({
    sessionToken: { type: String }
  }).validator(),
  run(fields) {
    authCheck("session.destroySession", this.userId);
    let sessionRecord: any;
    sessionRecord = getSession(this.userId, fields.sessionToken);
    sessionCheck("destroySession", sessionRecord, fields.sessionToken);

    if (sessionRecord) {
      userSessions.remove(sessionRecord._id);
    }
    return true;
  }
});

export const deActivateSession = new ValidatedMethod({
  name: "UserSession.deActivate",

  validate: new SimpleSchema({
    sessionToken: { type: String }
  }).validator(),
  run(fields) {
    authCheck("session.deActivate", this.userId);
    let sessionRecord: any;
    //sessionRecord = userSessions.findOne({ owner: this.userId, sessionToken: fields.sessionToken });
    sessionRecord = getSession(this.userId, fields.sessionToken);
    sessionCheck("deActivateSession", sessionRecord, fields.sessionToken);

    if (sessionRecord) {
      userSessions.update(sessionRecord._id, {
        $set: {
          active: false
        }
      });
    }
    return true;
  }
});

export const keepAliveUserSession = new ValidatedMethod({
  name: "UserSession.keepAlive",

  validate: new SimpleSchema({
    sessionToken: { type: String },
    activityDetected: { type: Boolean },
    force: { type: Boolean, optional: true }
  }).validator(),

  run(fields) {
    let sessionDetected = false;
    let killRequired = false;
    let inactivityTimeout: any;
    inactivityTimeout = Meteor.settings.public.session.inactivityTimeout || 3600000;
    let now: any;
    now = new Date();
    let id = "";
    let sessionRecord: any;
    if (this.userId && fields.sessionToken) {
      sessionRecord = getSession(this.userId, fields.sessionToken);
    }

    if (sessionRecord) {
      sessionDetected = true;
      let diff = sessionRecord.expiresOn - now;

      if (diff < 0) {
        killRequired = true;
        killSession.call({ id: this.userId, sessionToken: fields.sessionToken }, () => {});
      } else if (fields.activityDetected) {
        let expires = new Date(Date.now() + inactivityTimeout);
        userSessions.update(sessionRecord._id, {
          $set: {
            expiresOn: expires,
            diff: diff
          }
        });
      }
    }
    /*
    log.info(
      `keepAliveUserSession userId=[${this.userId}] sessionDetected=[${sessionDetected}] killRequired=[${killRequired}]`
    );
*/
    return id;
  }
});

export const purgeSessions = new ValidatedMethod({
  name: "session.purgeSessions",
  validate: null,

  run() {
    authCheck("session.purgeSessions", this.userId);
    userSessions.remove({ active: false });

    return true;
  }
});
