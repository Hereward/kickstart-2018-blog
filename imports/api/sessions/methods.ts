///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { userSessions } from "./publish";
import { userSettings } from "../settings/publish";
import { Auth } from "../auth/publish";
import { hash } from "../../modules/user";

/*
let serverAuth: any;
if (Meteor.isServer) {
  serverAuth = require("../../server/auth");
}
*/

const authCheck = (methodName, userId) => {
  let auth = true;
  if (!userId) {
    auth = false;
    log.warn(`authCheck (${methodName}) - NO USER ID`);
  }
  return auth;
};

const lockAccount = userId => {
  userSessions.remove({ owner: userId });
  userSettings.update(
    { owner: userId },
    {
      $set: { locked: true }
    }
  );
};

export const lockAccountToggle = userId => {
  const settings = userSettings.findOne({ owner: userId });

  if (settings) {
    const newSetting = !settings.locked;
    if (newSetting === false) {
      userSessions.remove({ owner: userId });
    }

    log.info(`lockAccountToggle`, newSetting, userId, settings);

    userSettings.update(
      { owner: userId },
      {
        $set: { locked: newSetting }
      }
    );
  }
};

const sessionCheck = (methodName, sessionRecord = "", sessionToken = "") => {
  if (!sessionRecord) {
    log.error(`${methodName} - invalidSession`, sessionToken);
  }
};

const getSession = function getSession(userId, sessionToken = "") {
  if (!userId || !sessionToken) {
    log.warn(
      `getSession - invalid - userId=[${userId}] sessionToken=[${sessionToken} Meteor.isServer=[${Meteor.isServer}]]`
    );
    return null;
  }
  let sessionRecord: any;
  let hashedToken = hash(sessionToken);
  sessionRecord = userSessions.findOne({ owner: userId, sessionToken: hashedToken, active: true });
  return sessionRecord;
};

const clearSessionAuth = (userId, sessionToken) => {
  if (!userId || !sessionToken) {
    log.warn(`clearSessionAuth - invalid - userId=[${userId}] sessionToken=[${sessionToken}]`);
    return null;
  }
  let sessionRecord: any;
  sessionRecord = getSession(userId, sessionToken);
  if (sessionRecord) {
    userSessions.update(sessionRecord._id, { $unset: { verified: "", currentAttempts: "" } });
  }
};

export const cancel2FASession = (userId, sessionToken, authEnabled) => {
  let sessionRecord: any;
  sessionRecord = getSession(userId, sessionToken);
  if (sessionRecord) {
    if (authEnabled === 3) {
      userSessions.update(sessionRecord._id, { $unset: { verified: "", currentAttempts: "" } });
    } else {
      userSessions.update(sessionRecord._id, { $set: { verified: true, currentAttempts: 0 } });
    }
  }
};

export const insertNewSession = function insert(userId, sessionToken = "", persist = false) {
  if (!userId || !sessionToken) {
    log.warn(`insertNewSession - invalid - userId=[${userId}] sessionToken=[${sessionToken}]`);
    return null;
  }

  let inactivityTimeout: any;
  let removeOptions = {};
  inactivityTimeout = Meteor.settings.public.session.inactivityTimeout || 3600000;
  let now: any;
  now = new Date();
  let expires: any = null;
  if (!persist) {
    expires = new Date(Date.now() + inactivityTimeout);
  }

  let hashedToken = hash(sessionToken);

  userSessions.remove({ sessionToken: hashedToken });

  let id = userSessions.insert({
    sessionToken: hashedToken,
    expired: false,
    active: true,
    expiresOn: expires,
    persist: persist,
    createdAt: now,
    owner: userId
  });

  return id;
};

const initSessionAuthVerified = (userId, sessionToken) => {
  if (!userId) {
    return null;
  }

  let sessionRecord: any;
  let sessionRecordUpdated: any;
  sessionRecord = getSession(userId, sessionToken);
  if (!sessionRecord) {
    insertNewSession(userId, sessionToken);
    sessionRecord = getSession(userId, sessionToken);
  }

  if (sessionRecord && sessionRecord.currentAttempts) {
    userSessions.update(sessionRecord._id, { $set: { verified: false } });
  } else if (sessionRecord) {
    userSessions.update(sessionRecord._id, { $set: { verified: false, currentAttempts: 0 } });
  }

  sessionRecordUpdated = userSessions.findOne(sessionRecord._id);
  return sessionRecordUpdated;
};

export const createUserSession = new ValidatedMethod({
  name: "UserSession.create",

  validate: new SimpleSchema({
    sessionToken: { type: String },
    keepMeLoggedIn: { type: Boolean, optional: true },
    userId: { type: String, optional: true }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      if (!authCheck("UserSession.create", this.userId)) {
        return false;
      }

      const userId = fields.userId ? fields.userId : this.userId;

      let persist = fields.keepMeLoggedIn === true;
      let sessionId = insertNewSession(userId, fields.sessionToken, persist);
      //let settings: any;
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
      if (!authCheck("UserSession.clearSessionAuthMethod", this.userId)) {
        return false;
      }
      clearSessionAuth(this.userId, fields.sessionToken);
    }
  }
});

export const purgeAllOtherSessions = new ValidatedMethod({
  name: "UserSession.purgeAllOtherSessions",

  validate: new SimpleSchema({
    sessionToken: { type: String },
    userId: { type: String, optional: true }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      if (!authCheck("UserSession.purgeAllOtherSessions", this.userId)) {
        return false;
      }
      let sessionRecord: any;
      const userId = fields.userId ? fields.userId : this.userId;
      sessionRecord = getSession(userId, fields.sessionToken);
      if (sessionRecord) {
        let query = {
          $and: [
            {
              owner: userId
            },
            {
              _id: { $ne: sessionRecord._id }
            }
          ]
        };
        userSessions.remove(query);
        log.info(`purgeAllOtherSessions - SUCCESS!`, userId, sessionRecord);
      }
    }

    return true;
  }
});

export const purgeAllSessions = new ValidatedMethod({
  name: "UserSession.purgeAllSessions",

  validate: new SimpleSchema({
    id: { type: String, optional: true }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      if (!authCheck("UserSession.purgeAllSessions", this.userId)) {
        return false;
      }
      const userId = fields.id || this.userId;
      let result = false;
      if (userId) {
        result = true;
        userSessions.remove({ owner: userId });
      }
      return result;
    }
  }
});

export const exceedAttemptsCheck = (verified, attemptsLeft, userId) => {
  let message: string;
  let recalctAttempts = attemptsLeft - 1;
  if ((attemptsLeft < 2 && !verified) || attemptsLeft < 1) {
    message = "You have exceeded the maximum allowed number of authentication attempts.";
    lockAccount(userId);
    throw new Meteor.Error(`invalidCode`, message);
  } else if (!verified && attemptsLeft > 0) {
    let attemptsLabel = recalctAttempts > 1 ? "attempts" : "attempt";

    message = `You have ${recalctAttempts} ${attemptsLabel} left.`;
    throw new Meteor.Error(`invalidCode`, message);
  } else {
    return true;
  }
};

export const updateAuth = (userId, sessionToken, verified) => {
  if (!authCheck("updateAuth", userId)) {
    return null;
  }
  let targetState: number;
  let operationType: string;
  let settingsRecord: any;
  let sessionRecord: any;
  let currentAttempts = 0;
  let attemptsLeft: number;
  let maxAttempts = Meteor.settings.public.enhancedAuth.maxAttempts;

  sessionRecord = initSessionAuthVerified(userId, sessionToken);
  attemptsLeft = maxAttempts - sessionRecord.currentAttempts;
  currentAttempts = sessionRecord.currentAttempts + 1;
  userSessions.update(sessionRecord._id, {
    $set: { currentAttempts: currentAttempts }
  });

  let attemptsOK = exceedAttemptsCheck(verified, attemptsLeft, userId);
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

    if (verified) {
      userSessions.update(sessionRecord._id, {
        $set: { currentAttempts: 0 }
      });
      userSettings.update(settings._id, {
        $set: { authEnabled: targetState }
      });
    }

    if (operationType === "disabled") {
      clearSessionAuth(userId, sessionToken);
    } else {
      userSessions.update(sessionRecord._id, {
        $set: { verified: verified }
      });
    }
  }

  return operationType;
};

export const purgeInactiveSessions = userId => {
  let inactivityTimeout = Meteor.settings.public.session.inactivityTimeout || 3600000;
  //let expires = new Date(Date.now() - inactivityTimeout * 3);
  let query = {
    $and: [
      {
        owner: userId
      },
      {
        active: false
      }
    ]
  };

  let cursor = userSessions.find(query);
  let count = cursor.count();
  let recs = cursor.fetch();
  if (recs) {
    log.info(`purgeSessions user=[${userId}] count=[${count}]`);
  } else {
    log.info(`purgeSessions user=[${userId}] count=[${count}] NO PURGE REQUIRED`);
  }
  userSessions.remove(query);
};

export const killSession = new ValidatedMethod({
  name: "UserSession.kill",
  validate: new SimpleSchema({
    sessionToken: { type: String },
    id: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      if (!authCheck("UserSession.kill", this.userId)) {
        return false;
      }
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
    if (!this.isSimulation) {
      if (!authCheck("UserSession.deActivate", this.userId)) {
        return false;
      }
      let sessionRecord: any;
      sessionRecord = getSession(this.userId, fields.sessionToken);

      if (sessionRecord) {
        userSessions.update(sessionRecord._id, {
          $set: {
            active: false
          }
        });
      }
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
    if (!this.isSimulation) {
      if (this.userId) {
        let sessionDetected = false;
        let killRequired = false;
        let inactivityTimeout: any;
        inactivityTimeout = Meteor.settings.public.session.inactivityTimeout || 3600000;
        let now: any;
        now = new Date();
        let sessionRecord: any;
        sessionRecord = getSession(this.userId, fields.sessionToken);
        if (sessionRecord && sessionRecord.persist === false) {
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
        } else if (!sessionRecord) {
          log.info(`keepAliveUserSession - restoring session`);
          insertNewSession(this.userId, fields.sessionToken);
        }
      }
    }
    return true;
  }
});
