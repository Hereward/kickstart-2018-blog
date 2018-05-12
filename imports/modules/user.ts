import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import * as RLocalStorage from "meteor/simply:reactive-local-storage";
import * as Library from "./library";
import {
  keepAliveUserSession,
  deActivateSession,
  purgeAllOtherSessions,
  purgeAllSessions,
  createUserSession
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
        console.log(`deActivateSession error`, err.reason);
      }
      Meteor.logout(() => {
        log.info(`User.logoutAndPurge() DONE`);
        clearLocalStorage();
        if (params.title || params.message) {
          Library.modalSuccessAlert({ title: params.title, message: params.message, location: params.newLocation });
        } else if (params.newLocation) {
          window.location = params.newLocation;
        }
      });
    });
  });
}

export function checkSessionStatus(prevProps?, newProps?) {
  if (id() && !loggingIn() && newProps.userData && prevProps.userSession && !newProps.userSession) {
    let sessionTokenString = sessionToken("get");
    if (!sessionTokenString) {
      purgeAllSessions.call({}, (err, res) => {
        if (err) {
          console.log(`purgeAllSessions error`, err.reason);
        }
        Meteor.logout(() => {
          clearLocalStorage();
          window.location = "/signin";
        });
      });
    } else {
      log.info(`checkSessionStatus - session dropped out! Token=`, sessionTokenString);
      keepAliveUserSession.call({ activityDetected: false, sessionToken: sessionTokenString }, (err, res) => {
        if (err) {
          console.log(`keepAliveUserSession client error`, err.reason);
        }
      });
    }
  }
  return false;
}
