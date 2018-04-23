import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { userSessions } from "../sessions/publish";
import { Auth } from "./publish";

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
    console.log(`authCheck (${methodName}) - NO USER ID`);
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
  return auth;
};

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

const initAuth = (authId, userId) => {
  let key: any;
  let secret: any;
  let user = Meteor.users.findOne(userId);
  let email = user.emails[0].address;
  let toDataURLObj = { error: "", url: "" };

  const buf = crypto.randomBytes(16);
  const randomString = buf.toString("hex");
  console.log(`initAuth - | randomString = [${randomString}]`, email);
  secret = speakeasy.generateSecret({
    length: 20,
    name: `Meteor KickStart: ${email}`
  });
  key = secret.base32;

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
    console.log(`initAuth toDataURL SUCCESS`);
    Auth.update(authId, { $set: { QRCodeURL_enc: urlEnc } });
  }

  return { key: key, url: toDataURLObj.url };
};

const exceedAttemptsCheck = (verified, attemptsLeft) => {
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

function encrypt(text, password) {
  let cipher = crypto.createCipheriv(
    Meteor.settings.private.enhancedAuth.algorithm,
    password,
    Meteor.settings.private.enhancedAuth.iv
  );
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
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
  return dec;
}

export const createAuth = new ValidatedMethod({
  name: "auth.create",

  validate: null,

  run() {
    authCheck("auth.create", this.userId);
    let key: any;
    let secret: any;
    Auth.remove({});

    let authId = Auth.insert({
      verified: false,
      currentAttempts: 0,
      private_key: key,
      private_key_enc: key,
      keyObj: secret,
      QRCodeShown: false,
      QRCodeURL: "",
      QRCodeURL_enc: "",
      cryptoKey: "",
      enabled: 0,
      owner: this.userId
    });

    return authId;
  }
});

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

export const init = new ValidatedMethod({
  name: "auth.init",

  validate: null,

  run(fields) {
    authCheck("auth.init", this.userId);
    let privateData: any;
    if (!this.isSimulation) {
      let authRecord: any;
      authRecord = Auth.findOne({ owner: this.userId });
      if (authRecord) {
        privateData = initAuth(authRecord._id, this.userId);
      }
    }
    return privateData;
  }
});

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

        Auth.update(authRecord._id, { $set: { enabled: targetState, verified: false } });
        console.log(`auth.activate - DONE!`);
      } else {
        console.log(`auth.activate - No auth record found.`);
      }
    }
  }
});

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

export const initUserLogin = new ValidatedMethod({
  name: "auth.initUserLogin",
  validate: null,

  run(fields) {
    authCheck("auth.initUserLogin", this.userId);
    let enabled: any = 0;
    let authRecord: any;
    authRecord = Auth.findOne({ owner: this.userId });

    if (authRecord) {
      enabled = authRecord.enabled;
      Auth.update(authRecord._id, { $set: { verified: false } });
    }

    log.info(`auth.initUserLogin`, enabled);

    return enabled;
  }
});

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

export const verifyToken = new ValidatedMethod({
  name: "auth.verifyToken",
  validate: new SimpleSchema({
    myToken: { type: String }
  }).validator(),

  run(fields) {
    authCheck("auth.verifyToken", this.userId);
    let verified = true;
    let targetState: number;
    let operationType: string;
    let ownerId = this.userId;
    let authRecord: any;
    let maxAttempts = Meteor.settings.public.enhancedAuth.maxAttempts;
    authRecord = Auth.findOne({ owner: ownerId });

    if (!this.isSimulation) {
      let secret = decrypt(authRecord.private_key_enc, authRecord.cryptoKey);

      verified = speakeasy.time.verify({
        secret: secret,
        encoding: "base32",
        token: fields.myToken,
        window: 2
      });

      let attemptsLeft = maxAttempts - (authRecord.currentAttempts + 1);

      if (!verified) {
        let currentAttempts = authRecord.currentAttempts + 1;
        Auth.update(authRecord._id, { $set: { verified: false, QRCodeShown: true, currentAttempts: currentAttempts } });
      }

      let attemptsOK = exceedAttemptsCheck(verified, attemptsLeft);

      if (attemptsOK) {
        let currentState = authRecord.enabled;
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
        Auth.update(authRecord._id, {
          $set: { verified: true, QRCodeShown: true, currentAttempts: 0, enabled: targetState }
        });
      }
    }

    return { verified: verified, operationIndicator: operationType };
  }
});
