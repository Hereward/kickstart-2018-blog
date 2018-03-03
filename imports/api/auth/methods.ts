import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Auth } from "./publish";

let Future: any;
let QRCode: any;
let speakeasy = require("speakeasy");

declare var Npm: any;

if (Meteor.isServer) {
  Future = Npm.require("fibers/future");
  QRCode = require("qrcode");
}

const authCheck = (userId, methodName) => {
  if (!userId) {
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
};

const exceedAttemptsCheck = (verified, attemptsLeft) => {
  //console.log("exceedAttemptsCheck", verified, attemptsLeft);
  let message: string;
  if (attemptsLeft < 1) {
    message = "You have exceeded the maximum allowed number of authentication attempts. Please contact Admin.";
    throw new Meteor.Error(`exceededAttempts`, message);
  } else if (!verified && attemptsLeft > 0) {
    message = `You have ${attemptsLeft} attempts left.`;
    throw new Meteor.Error(`invalidCode`, message);
  } else {
    return true;
  }
};

//let objData = JSON.stringify(options);

export const createAuth = new ValidatedMethod({
  name: "auth.create",

  validate: new SimpleSchema({
    owner: { type: String }
  }).validator(),

  run(fields) {
    authCheck("auth.create", this.userId);
    let key: any;
    let secret: any;
    let user = Meteor.users.findOne(this.userId);
    let email = user.emails[0].address;
    let toDataURLObj = { error: "", url: "" };

    console.log(`auth.create`, fields);

    let id = Auth.insert({
      verified: false,
      currentAttempts: 0,
      private_key: key,
      keyObj: secret,
      QRCodeShown: false,
      QRCodeURL: "",
      owner: fields.owner
    });

    if (!this.isSimulation) {
      secret = speakeasy.generateSecret({
        length: 20,
        name: `Personal Web Wallet: ${email}`
      });
      key = secret.base32;
      console.log(`auth.create: secret`, secret);

      Auth.update(id, { $set: { private_key: key, keyObj: secret } });

      let future = new Future();
      QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
        future.return({ error: err, url: dataUrl });
      });

      toDataURLObj = future.wait();
      //output = toDataURLObj.url;

      if (toDataURLObj.error) {
        console.log(`toDataURL FAIL: `, toDataURLObj.error);
        throw new Meteor.Error(
          `toDataURL FAIL [auth.generateQRCode] [${toDataURLObj.error}]`,
          "Could not retrieve QRCode URL."
        );
      } else {
        console.log(`toDataURL SUCCESS`);
        Auth.update(id, { $set: { QRCodeURL: toDataURLObj.url } });
      }
    }

    //console.log(`auth.create: key = [${key}]`);

    console.log(`auth.create - DONE id=[${id}]`);
    return id;
  }
});

export const setPrivateKey = new ValidatedMethod({
  name: "auth.setPrivateKey",

  validate: new SimpleSchema({
    private_key: { type: String }
  }).validator(),

  run(fields) {
    authCheck("auth.setPrivateKey", this.userId);
    let ownerId = this.userId;
    let authRecord: any;
    authRecord = Auth.findOne({ owner: ownerId });

    //console.log(`authRecord`, authRecord);
    /*
    console.log(
      `METHODS: auth.setPrivateKey fields.private_key = [${
        fields.private_key
      }] authRecord._id = [${authRecord._id}] `
    );
    */

    Auth.update(authRecord._id, { $set: { private_key: fields.private_key } });
    console.log(`auth.setPrivateKey - DONE!`);
  }
});

export const generateQRCode = new ValidatedMethod({
  name: "auth.generateQRCode",

  validate: new SimpleSchema({
    otpauth_url: { type: String },
    id: { type: String }
  }).validator(),

  run(fields) {
    authCheck("auth.generateQRCode", this.userId);
    let toDataURLObj = { error: "", url: "" };
    let output: string; // = { key: "", url: "" };
    let user = Meteor.users.findOne(this.userId); //Meteor.users.find({_id: this.userId});
    let email = user.emails[0].address;
    //let keyBase32: string;

    console.log(`auth.generateQRCode: [${fields.otpauth_url}]`);

    if (!this.isSimulation) {
      /*
      let key = speakeasy.generateSecret({
        length: 20,
        name: `Personal Web Wallet: ${email}`
      });
      output.key = key.base32;
      console.log(`key`, key.base32);
      */

      let future = new Future();
      QRCode.toDataURL(fields.otpauth_url, (err, dataUrl) => {
        future.return({ error: err, url: dataUrl });
      });

      toDataURLObj = future.wait();
      output = toDataURLObj.url;
      console.log(`QRCodeURL [SERVER]`, output);
    }

    //let ownerId = this.userId;
    //let authRecord: any;
    //authRecord = Auth.findOne({ owner: ownerId });

    console.log(`auth.generateQRCode - DONE!`);

    if (toDataURLObj.error) {
      throw new Meteor.Error(
        `toDataURL FAIL [auth.generateQRCode] [${toDataURLObj.error}]`,
        "Could not retrieve QRCode URL."
      );
    } else {
      Auth.update(fields.id, { $set: { QRCodeShown: true } });
    }

    return output;
  }
});

export const currentValidToken = new ValidatedMethod({
  name: "auth.currentValidToken",
  validate: new SimpleSchema({
    key: { type: String }
  }).validator(),

  run(fields) {
    authCheck("auth.currentValidToken", this.userId);
    //console.log(`auth.currentValidToken - START`);
    let token: any = "000000";
    if (!this.isSimulation) {
      if (fields.key) {
        token = speakeasy.totp({
          secret: fields.key,
          encoding: "base32"
        });
      }
      //console.log(`TOKEN = [${token}]`);
      //console.log(`auth.currentValidToken - DONE!`, token);
    }
    return token;
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

    Auth.update(authRecord._id, { $set: { verified: fields.verified } });
    console.log(`auth.setVerified - DONE!`);
  }
});

export const verifyToken = new ValidatedMethod({
  name: "auth.verifyToken",
  validate: new SimpleSchema({
    key: { type: String },
    myToken: { type: String }
  }).validator(),

  run(fields) {
    authCheck("auth.currentValidToken", this.userId);
    let verified = true;
    let ownerId = this.userId;
    let authRecord: any;
    let maxAttempts = Meteor.settings.public.enhancedAuth.maxAttempts;
    authRecord = Auth.findOne({ owner: ownerId });

    if (!this.isSimulation) {
      verified = speakeasy.time.verify({
        secret: fields.key,
        encoding: "base32",
        token: fields.myToken,
        window: 2
      });

      let attemptsLeft = maxAttempts - (authRecord.currentAttempts + 1);
/*
      console.log(`verifyToken 
      current=[${authRecord.currentAttempts}]
      maxAttempts=[${maxAttempts}]
      attemptsLeft=[${attemptsLeft}]
      `);
*/
      if (!verified) {
        let currentAttempts = authRecord.currentAttempts + 1;
        Auth.update(authRecord._id, { $set: { verified: false, QRCodeShown: true, currentAttempts: currentAttempts } });
      }

      let attemptsOK = exceedAttemptsCheck(verified, attemptsLeft);

      if (attemptsOK) {
        Auth.update(authRecord._id, { $set: { verified: true, QRCodeShown: true, currentAttempts: 0 } });
      }
    }

    return verified;
  }
});
