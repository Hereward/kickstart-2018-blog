import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import * as RLocalStorage from "meteor/simply:reactive-local-storage";
import { Roles } from "meteor/alanning:roles";
import * as Library from "./library";
import {
  keepAliveUserSession,
  deActivateSession,
  purgeAllOtherSessions,
  purgeAllSessions
} from "../api/sessions/methods";

const sessionTokenName = Meteor.settings.public.session.sessionTokenName;
const userDataKey = Meteor.settings.public.session.userDataKey;
declare var window: any;

export function hash(token, algorithm = "md5") {
  const crypto = require("crypto");
  const hash = crypto.createHash(algorithm);
  hash.update(token);
  let hashString = hash.digest("hex");
  return hashString;
}

export function id() {
  return Meteor.userId();
}

export function data() {
  let user: any;
  user = Meteor.user();
  let userId = id();
  if (!user && userId) {
    let cachedUser = RLocalStorage.getItem(userDataKey);
    if (cachedUser && cachedUser._id === userId) {
      user = cachedUser;
    }
  }
  return user;
}

export function clearLocalStorage() {
  localStorage.removeItem(sessionTokenName);
  localStorage.removeItem(userDataKey);
}

export function setUserDataCache(userData) {
  RLocalStorage.setItem(userDataKey, userData);
}

export function loggingIn() {
  const loggingIn = Meteor.loggingIn();
  return loggingIn;
}

function createSessionTokenData() {
  const crypto = require("crypto");
  const buf = crypto.randomBytes(16);
  const randomString = buf.toString("hex");
  return randomString;
}

export function sessionToken(action, value?: string, key?: string) {
  if (!key) {
    key = sessionTokenName;
  }

  if (action === "create" && !value) {
    value = createSessionTokenData();
  }

  let output: any;

  switch (action) {
    case "get":
      output = RLocalStorage.getItem(key);
      break;

    case "create":
      RLocalStorage.setItem(key, value);
      output = value;
      break;

    case "remove":
      localStorage.removeItem(key);
      output = true;
      break;
  }

  return output;
}

export function logoutAndPurgeSessions(params: { title?: string; message?: string; newLocation?: string }) {
  let sToken = sessionToken("get");
  purgeAllOtherSessions.call({ sessionToken: sToken }, (err, res) => {
    if (err) {
      Library.modalErrorAlert(err.reason);
      console.log(`purgeAllOtherSessions error`, err);
    }
    deActivateSession.call({ sessionToken: sToken }, (err, res) => {
      if (err) {
        console.log(`deActivateSession error`, err);
      }
      Meteor.logout(() => {
        log.info(`User.logoutAndPurge() DONE`);
        //clearLocalStorage();
        if (params.title || params.message) {
          Library.modalSuccessAlert({ title: params.title, message: params.message, location: params.newLocation });
        } else if (params.newLocation) {
          window.location.assign(params.newLocation);
        }
      });
    });
  });
}

export function checkSessionStatus(prevProps?, newProps?) {
  if (id() && !loggingIn() && newProps.userData && prevProps.userSession && !newProps.userSession) {
    let sessionTokenString = sessionToken("get");
    if (!sessionTokenString) {
      log.info(`User.checkSessionStatus no sessionTokenString!`, id(), data(), prevProps, newProps);
      purgeAllSessions.call({}, (err, res) => {
        if (err) {
          console.log(`purgeAllSessions error`, err.reason);
        }
        if (res) {
          Meteor.logout(() => {
            log.info(`User.checkSessionStatus logout() DONE`);
            //window.location = "/signin";
          });
        }
      });
    } else {
      log.info(
        `checkSessionStatus - session dropped out! Token=[${sessionTokenString}]`,
        id(),
        data(),
        prevProps,
        newProps
      );
      keepAliveUserSession.call({ activityDetected: false, sessionToken: sessionTokenString }, (err, res) => {
        if (err) {
          console.log(`keepAliveUserSession client error`, err.reason);
        }
      });
    }
  }
  return false;
}

export function authRequired(props) {
  //log.info(`authRequired`, props);
  //let emailVerified = Library.nested(["userData", "emails", 0, "verified"], props);
  let verified = Library.nested(["userSession", "verified"], props);
  // let locked = Library.nested(["userSettings", "locked"], props);
  let authEnabled = Library.nested(["userSettings", "authEnabled"], props);
  let loggingOut = props.loggingOut;
  let authRequired = false;

  if (id() && props.userSession && props.sessionReady && loggingOut === false) {
    if (authEnabled > 1 || (authEnabled === 1 && !verified)) {
      authRequired = true;
    }
  }

  return authRequired;
}

export function can(params: { do?: string; threshold?: any }) {
  let allowed: boolean;
  let userId = id();

  if (!userId) {
    allowed = false;
  } else if (Roles.userIsInRole(id(), "super-admin")) {
    allowed = true;
  } else if (params.threshold && params.threshold === "admin") {
    allowed = Roles.userIsInRole(this.userId, ["super-admin", "admin"]);
  } else if (params.threshold) {
    allowed = Roles.userIsInRole(id(), params.threshold);
  } else {
    allowed = true;
  }

  return allowed;
}

// Roles.userIsInRole(this.userId, ["super-admin", "admin"]);