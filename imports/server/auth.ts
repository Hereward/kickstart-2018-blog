import { Auth } from "../api/auth/publish";
declare var Npm: any;
declare var exports: any;
//declare var speakeasy: any;

const crypto = require("crypto");
const speakeasy = require("speakeasy");
const Future = Npm.require("fibers/future");
const QRCode = require("qrcode");

exports.hash = function hash(token, algorithm = "md5") {
  const crypto = require("crypto");
  const hash = crypto.createHash(algorithm);
  hash.update(token);
  let hashString = hash.digest("hex");
  return hashString;
};

exports.initAuth = function initAuth(authId, userId) {
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

  let keyEncrypted = exports.encrypt(key, randomString);
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
    let urlEnc = exports.encrypt(toDataURLObj.url, randomString);
    Auth.update(authId, { $set: { QRCodeURL_enc: urlEnc } });
  }

  return { key: key, url: toDataURLObj.url };
};

exports.encrypt = function encrypt(text, password) {
  let cipher = crypto.createCipheriv(
    Meteor.settings.private.enhancedAuth.algorithm,
    password,
    Meteor.settings.private.enhancedAuth.iv
  );
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
};

exports.decrypt = function decrypt(text, password) {
  let decipher = crypto.createDecipheriv(
    Meteor.settings.private.enhancedAuth.algorithm,
    password,
    Meteor.settings.private.enhancedAuth.iv
  );
  let dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
};
