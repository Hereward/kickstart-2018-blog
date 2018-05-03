import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import * as RLocalStorage from "meteor/simply:reactive-local-storage";
import { keepAliveUserSession, restoreUserSession } from "../api/sessions/methods";

const sessionTokenName = Meteor.settings.public.session.sessionTokenName;

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
  const user = Meteor.user();
  return user;
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

export function checkSessionToken(prevProps?, newProps?) {
  if (id() && !loggingIn() && newProps.userData && prevProps.userSession && !newProps.userSession) {
    let sessionTokenString = sessionToken("get"); 
    
    if (!sessionTokenString) {
      sessionTokenString = sessionToken("create");
      restoreUserSession.call({ sessionToken: sessionTokenString }, (err, res) => {
        if (err) {
          console.log(`restoreUserSession client error`, err.reason);
        }
        log.info(`restoreSession - token was re-generated`, sessionTokenString);
      });
      return true;
    } else {
      log.info(`checkSessionToken - session dropped out! Token=`, sessionTokenString);
      keepAliveUserSession.call({ activityDetected: false, sessionToken: sessionToken('get')}, (err, res) => {
        if (err) {
          console.log(`keepAliveUserSession client error`, err.reason);
        }
      });
      return true;
    }
  }
  return false;
}
