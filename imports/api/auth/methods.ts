import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { userSessions } from "../sessions/publish";
import { userSettings } from "../settings/publish";
import { Auth } from "./publish";
import { getSession, exceedAttemptsCheck, updateAuth as sessionUpdateAuth } from "../sessions/methods";

let Future: any;
let QRCode: any;
let speakeasy = require("speakeasy");

declare var Npm: any;

let crypto = require("crypto");

if (Meteor.isServer) {
  Future = Npm.require("fibers/future");
  QRCode = require("qrcode");
}

const authCheck = (methodName, userId) => {
  let auth = true;
  if (!userId) {
    auth = false;
    //console.log(`authCheck (${methodName}) - NO USER ID`);
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
  return auth;
};

const authFind = userId => {
  let rec: any;
  rec = Auth.findOne({ owner: userId });
  return rec;
};

/*
const forceLogout = userId => {
  let sessionRecord: any;
  sessionRecord = userSessions.findOne({ owner: userId });
  if (sessionRecord) {
    userSessions.update(
      { owner: userId },
      {
        $set: {
          expired: true
        }
      }
    );
  }
};
*/

export const insertAuth = function insert(userId) {
  let id = Auth.insert({
    private_key_enc: "",
    QRCodeURL_enc: "",
    cryptoKey: "",
    owner: userId
  });

  return id;
};

export const initAuth = (authId, userId) => {
  let key: any;
  let secret: any;
  let user = Meteor.users.findOne(userId);
  let email = user.emails[0].address;
  let toDataURLObj = { error: "", url: "" };

  const buf = crypto.randomBytes(16);
  const randomString = buf.toString("hex");
  //console.log(`initAuth - | randomString = [${randomString}]`, email);
  secret = speakeasy.generateSecret({
    length: 20,
    name: `Meteor KickStart: ${email}`
  });
  key = secret.base32;
  log.info(`initAuth - Raw Key`, key);

  let keyEncrypted = encrypt(key, randomString);
  console.log(`initAuth keyEncrypted SUCCESS [${keyEncrypted}]`);
  Auth.update(authId, { $set: { private_key_enc: keyEncrypted, cryptoKey: randomString } });
  let future = new Future();
  QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
    future.return({ error: err, url: dataUrl });
  });
  toDataURLObj = future.wait();
  if (toDataURLObj.error) {
    console.log(`initAuth toDataURL FAIL: `, toDataURLObj.error);
    throw new Meteor.Error(
      `initAuth toDataURL FAIL [initAuth] [${toDataURLObj.error}]`,
      "Could not retrieve QRCode URL."
    );
  } else {
    let urlEnc = encrypt(toDataURLObj.url, randomString);
    //console.log(`initAuth toDataURL SUCCESS`);
    Auth.update(authId, { $set: { QRCodeURL_enc: urlEnc } });
  }

  return { key: key, url: toDataURLObj.url };
};

function encrypt(text, password) {
  let cipher = crypto.createCipheriv(
    Meteor.settings.private.enhancedAuth.algorithm,
    password,
    Meteor.settings.private.enhancedAuth.iv
  );
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  //log.info(`encrypt`, text);
  return crypted;
}

function decrypt(text, password) {
  let decipher = crypto.createDecipheriv(
    Meteor.settings.private.enhancedAuth.algorithm,
    password,
    Meteor.settings.private.enhancedAuth.iv
  );
  let dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  //log.info(`decrypt`, dec);
  return dec;
}

export const createAuth = new ValidatedMethod({
  name: "auth.create",

  validate: null,

  run() {
    authCheck("auth.create", this.userId);
    Auth.remove({ owner: this.userId });
    let authId = insertAuth(this.userId);
    return authId;
  }
});

/*
export const decryptKey = new ValidatedMethod({
  name: "auth.decryptKey",

  validate: null,

  run(fields) {
    authCheck("auth.decryptKey", this.userId);
    if (!this.isSimulation) {
      let authRecord: any;
      authRecord = Auth.findOne({ owner: this.userId });
      if (authRecord && authRecord.private_key_enc && authRecord.QRCodeURL_enc) {
        let privateKey = decrypt(authRecord.private_key_enc, authRecord.cryptoKey);

        let QRCodeURL = decrypt(authRecord.QRCodeURL_enc, authRecord.cryptoKey);

        Auth.update(authRecord._id, { $set: { private_key: privateKey, QRCodeURL: QRCodeURL } });
        console.log(`auth.decryptKey - DONE!`);
      }
    }
  }
});
*/

export const getDecrpytedAuthData = new ValidatedMethod({
  name: "auth.getDecrpytedAuthData",

  validate: null,

  run(fields) {
    authCheck("auth.getDecrpytedAuthData", this.userId);
    let privateData: any;
    let privateKey: string;
    let url: string;
    if (!this.isSimulation) {
      let authRecord: any;
      authRecord = Auth.findOne({ owner: this.userId });
      if (authRecord) {
        privateKey = decrypt(authRecord.private_key_enc, authRecord.cryptoKey);
        url = decrypt(authRecord.QRCodeURL_enc, authRecord.cryptoKey);
        privateData = { key: privateKey, url: url };
      }
    }
    return privateData;
  }
});

/*
export const cancel = new ValidatedMethod({
  name: "auth.cancel",

  validate: null,

  run(fields) {
    authCheck("auth.cancel", this.userId);
    if (!this.isSimulation) {
      let authRecord: any;
      authRecord = Auth.findOne({ owner: this.userId });
      if (authRecord) {
        Auth.update(authRecord._id, { $set: { enabled: 0, verified: false } });
        console.log(`auth.cancel - DONE!`);
      }
    }
  }
});
*/

/*
export const deletetKey = new ValidatedMethod({
  name: "auth.deletetKey",

  validate: null,

  run(fields) {
    authCheck("auth.deletetKey", this.userId);
    let authRecord: any;
    authRecord = Auth.findOne({ owner: this.userId });
    if (authRecord) {
      Auth.update(authRecord._id, { $set: { private_key: "", QRCodeURL: "" } });
      console.log(`auth.deletetKey - DONE!`);
    }
  }
});
*/

export const currentValidToken = new ValidatedMethod({
  name: "auth.currentValidToken",
  validate: null,

  run() {
    authCheck("auth.currentValidToken", this.userId);
    let token: any = "initialising...";

    let authRecord: any;
    if (!this.isSimulation) {
      authRecord = Auth.findOne({ owner: this.userId });
      if (authRecord && authRecord.private_key_enc) {
        let secret = decrypt(authRecord.private_key_enc, authRecord.cryptoKey);

        token = speakeasy.totp({
          secret: secret,
          encoding: "base32"
        });
      }
    }

    return token;
  }
});

/*

export const toggleEnabledPending = new ValidatedMethod({
  name: "auth.activate",

  validate: null,

  run(fields) {
    authCheck("auth.setVerified", this.userId);
    if (!this.isSimulation) {
      let ownerId = this.userId;
      let authRecord: any;
      authRecord = Auth.findOne({ owner: ownerId });

      if (authRecord) {
        let currentState = authRecord.enabled;
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

        if (targetState === 3) {
          initAuth(authRecord._id, this.userId);
        }
        
        Auth.update(authRecord._id, { $set: { enabled: targetState, verified: false } });
        console.log(`auth.activate - DONE!`);
      } else {
        console.log(`auth.activate - No auth record found.`);
      }
    }
  }
});
*/

/*
export const cleanup = new ValidatedMethod({
  name: "auth.cleanup",

  validate: null,

  run(fields) {
    authCheck("auth.cleanup", this.userId);
    let targetState: number;
    let ownerId = this.userId;
    let authRecord: any;
    let logOutRequired: boolean = false;
    if (!this.isSimulation) {
      authRecord = Auth.findOne({ owner: ownerId });

      if (authRecord) {
        let currentState = authRecord.enabled;
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

        Auth.update(authRecord._id, {
          $set: { verified: false, enabled: targetState }
        });

        if (logOutRequired) {
          forceLogout(this.userId);
        }
        console.log(`auth.cleanup - DONE!`);
      } else {
        console.log(`auth.cleanup - No auth record found.`);
      }
    }
    return logOutRequired;
  }
});
*/

/*
export const initUserLogin = new ValidatedMethod({
  name: "auth.initUserLogin",
  validate: null,

  run(fields) {
    authCheck("auth.initUserLogin", this.userId);
    let enabled: any = 0;
    let authRecord: any;
    authRecord = Auth.findOne({ owner: this.userId });

    if (authRecord) {
      Auth.update(authRecord._id, { $set: { verified: false } });
    }


    return enabled;
  }
});
*/

/*
export const validateUserLogin = new ValidatedMethod({
  name: "auth.validateUserLogin",
  validate: null,

  run(fields) {
    authCheck("auth.validateUserLogin", this.userId);
    let targetState: number;
    let authRecord: any;
    authRecord = Auth.findOne({ owner: this.userId });

    if (!this.isSimulation) {
      if (!authRecord.verified && authRecord.enabled !== 0) {
        let currentState = authRecord.enabled;
        switch (currentState) {
          case 1:
            targetState = 1;
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

        Auth.update(authRecord._id, {
          $set: { enabled: targetState }
        });

        if (currentState === 1 || currentState === 3) {
          forceLogout(this.userId);
        }

        log.info(`validateUserLogin - forcing logout`);
      }
    }

    return targetState;
  }
});
*/

/*
export const setVerified = new ValidatedMethod({
  name: "auth.setVerified",

  validate: new SimpleSchema({
    verified: { type: Boolean }
  }).validator(),

  run(fields) {
    authCheck("auth.setVerified", this.userId);
    let ownerId = this.userId;
    let authRecord: any;
    authRecord = Auth.findOne({ owner: ownerId });

    if (authRecord) {
      Auth.update(authRecord._id, { $set: { verified: fields.verified } });
      console.log(`auth.setVerified - DONE!`);
    } else {
      console.log(`auth.setVerified - No auth record found.`);
    }
  }
});
*/

export const verifyToken = new ValidatedMethod({
  name: "auth.verifyToken",
  validate: new SimpleSchema({
    myToken: { type: String },
    sessionToken: { type: String }
  }).validator(),

  run(fields) {
    authCheck("auth.verifyToken", this.userId);
    let verified = false;
    let operationType: string;
    let authRecord: any;
    authRecord = Auth.findOne({ owner: this.userId });

    if (!this.isSimulation) {
      let secret = decrypt(authRecord.private_key_enc, authRecord.cryptoKey);
      log.info("verifyToken - decrypted private key", secret);

      verified = speakeasy.time.verify({
        secret: secret,
        encoding: "base32",
        token: fields.myToken,
        window: 2
      });

      operationType = sessionUpdateAuth(this.userId, fields.sessionToken, verified);
    }

    return { verified: verified, operationIndicator: operationType };
  }
});
