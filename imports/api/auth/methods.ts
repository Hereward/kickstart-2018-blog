import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { userSessions } from "../sessions/publish";
import { userSettings } from "../settings/publish";
import { Auth } from "./publish";
import { getSession, updateAuth as sessionUpdateAuth } from "../sessions/methods";

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
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
  return auth;
};

const authFind = userId => {
  let rec: any;
  rec = Auth.findOne({ owner: userId });
  return rec;
};

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
  secret = speakeasy.generateSecret({
    length: 20,
    name: `Meteor KickStart: ${email}`
  });
  key = secret.base32;

  let keyEncrypted = encrypt(key, randomString);
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
    Auth.remove({ owner: this.userId });
    let authId = insertAuth(this.userId);
    return authId;
  }
});

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

export const currentValidToken = new ValidatedMethod({
  name: "auth.currentValidToken",
  validate: null,

  run() {
    let token: any;
    if (!this.isSimulation) {
      //authCheck("auth.currentValidToken", this.userId);
      if (this.userId) {
        token = "initialising...";
        let authRecord: any;
        authRecord = Auth.findOne({ owner: this.userId });
        if (authRecord && authRecord.private_key_enc) {
          let secret = decrypt(authRecord.private_key_enc, authRecord.cryptoKey);
          token = speakeasy.totp({
            secret: secret,
            encoding: "base32"
          });
        }
      }
    }

    return token;
  }
});

export const verifyToken = new ValidatedMethod({
  name: "auth.verifyToken",
  validate: new SimpleSchema({
    myToken: { type: String },
    sessionToken: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      let verified = false;
      let operationType: string;
      authCheck("auth.verifyToken", this.userId);

      let authRecord: any;
      authRecord = Auth.findOne({ owner: this.userId });
      let secret = decrypt(authRecord.private_key_enc, authRecord.cryptoKey);

      verified = speakeasy.time.verify({
        secret: secret,
        encoding: "base32",
        token: fields.myToken,
        window: 2
      });

      operationType = sessionUpdateAuth(this.userId, fields.sessionToken, verified);
      return { verified: verified, operationIndicator: operationType };
    }
  }
});
