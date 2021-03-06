import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { userSessions } from "../sessions/publish";
import { userSettings } from "../settings/publish";
import { Auth } from "./publish";
import { updateAuth as sessionUpdateAuth } from "../sessions/methods";

let speakeasy = require("speakeasy");
let serverAuth: any;

let crypto = require("crypto");

if (Meteor.isServer) {
  serverAuth = require("../../server/auth");
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

export const createAuth = new ValidatedMethod({
  name: "auth.create",

  validate: new SimpleSchema({
    userId: { type: String, optional: true }
  }).validator(),

  run(fields) {
    authCheck("auth.create", this.userId);
    const userId = fields.userId ? fields.userId : this.userId;
    Auth.remove({ owner: userId });
    let authId = insertAuth(userId);
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
        privateKey = serverAuth.decrypt(authRecord.private_key_enc, authRecord.cryptoKey);
        url = serverAuth.decrypt(authRecord.QRCodeURL_enc, authRecord.cryptoKey);
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
      if (this.userId) {
        token = "initialising...";
        let authRecord: any;
        authRecord = Auth.findOne({ owner: this.userId });
        if (authRecord && authRecord.private_key_enc) {
          let secret = serverAuth.decrypt(authRecord.private_key_enc, authRecord.cryptoKey);
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
      let secret = serverAuth.decrypt(authRecord.private_key_enc, authRecord.cryptoKey);

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
