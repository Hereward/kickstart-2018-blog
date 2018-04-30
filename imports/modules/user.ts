import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import * as RLocalStorage from "meteor/simply:reactive-local-storage";
import { restoreUserSession } from "../api/sessions/methods";
//import * as Library from "./library";

const sessionTokenName = Meteor.settings.public.session.sessionTokenName;
//"Meteor.Kickstart2018.SessionToken";

export function hash(token, algorithm = "md5") {
  const crypto = require("crypto");
  //let hash = crypto.createHash('md5').update(token).digest('hex');
  //sha256
  const hash = crypto.createHash(algorithm);
  hash.update(token);
  let hashString = hash.digest("hex");
  //log.info(`hash`, token, hashString);
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
      //output = localStorage.getItem(key);
      output = RLocalStorage.getItem(key);
      break;

    case "create":
      //localStorage.setItem(key, value);
      //Session.set(key, value);
      RLocalStorage.setItem(key, value);
      output = value;
      break;

    case "remove":
      localStorage.removeItem(key);
      output = true;
      break;
  }

  //log.info(`sessionToken`, action, value, key, output);

  return output;
}

export function checkSessionToken(prevProps?, newProps?) {
  if (id() && !loggingIn() && newProps.userData && prevProps.userSession && !newProps.userSession) {
    //if (prevProps && newProps) {
      /*
      if (!prevProps.userSession || newProps.userSession === prevProps.userSession) {
        log.info(`checkSessionToken - ABORT (NO NEW DATA)`);
        return false;
      }
      */
    //}

    log.info(`checkSessionToken - SESSION DATA CHANGED`, prevProps, newProps);

    let sessionTokenString = sessionToken("get"); //RLocalStorage.getItem("Meteor.Kickstart2018.SessionToken");

    if (!sessionTokenString) {
      sessionTokenString = sessionToken("create");
      log.info(`restoreSession - token was re-generated`, sessionTokenString);
    }

    restoreUserSession.call({ sessionToken: sessionTokenString }, (err, res) => {
      if (err) {
        console.log(`restoreUserSession client error`, err.reason);
      }
    });
  } else {
    //log.info(`checkSessionToken - (NO USER DATA OR NO CHANGING DATA)`);
    return false;
  }
}
