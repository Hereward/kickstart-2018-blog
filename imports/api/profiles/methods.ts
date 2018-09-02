import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Profiles } from "./publish";
import { userSettings } from "../settings/publish";

const authCheck = (methodName, userId) => {
  let auth = true;
  if (!userId) {
    auth = false;
    console.log(`authCheck (${methodName}) - NO USER ID`);
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
  return auth;
};

export const newProfile = userId => {
  Profiles.remove({ owner: userId });
  const user = Meteor.users.findOne(userId);
  const email = user.emails[0].address;
  const nameArray = email.split("@");
  const screenName = nameArray[0].substring(0, 20);
  let id = Profiles.insert({
    screenName: screenName,
    about: "I am awesome!",
    fname: "",
    initial: "",
    lname: "",
    dob: "",
    street1: "",
    street2: "",
    city: "",
    region: "",
    postcode: "",
    country: "",
    avatarId: "",
    new: true,
    created: new Date(),
    owner: userId
  });

  return id;
};

export const createProfile = new ValidatedMethod({
  name: "profiles.create",

  validate: new SimpleSchema({
    fname: { type: String },
    initial: { type: String },
    lname: { type: String },
    userId: { type: String, optional: true }
  }).validator(),

  run(fields) {
    authCheck("profiles.create", this.userId);
    const userId = fields.userId ? fields.userId : this.userId;
    const id = newProfile(userId);
    return id;
  }
});

export const updateProfileImage = new ValidatedMethod({
  name: "profileImage.update",
  validate: new SimpleSchema({
    id: { type: String },
    avatarId: { type: String }
  }).validator(),

  run(fields) {
    log.info(`profileImage.update`, fields.id, fields.avatarId);
    authCheck("profileImage.update", this.userId);

    Profiles.update(fields.id, {
      $set: {
        avatarId: fields.avatarId
      }
    });

    return true;
  }
});

export const updateProfile = new ValidatedMethod({
  name: "profiles.update",
  validate: new SimpleSchema({
    id: { type: String },
    screenName: { type: String },
    about: { type: String },
    fname: { type: String },
    initial: { type: String },
    lname: { type: String },
    dob: { type: String },
    street1: { type: String },
    street2: { type: String },
    city: { type: String },
    region: { type: String },
    postcode: { type: String },
    country: { type: String }
  }).validator(),

  run(fields) {
    authCheck("profiles.update", this.userId);

    Profiles.update(fields.id, {
      $set: {
        screenName: fields.screenName,
        about: fields.about,
        fname: fields.fname,
        initial: fields.initial,
        lname: fields.lname,
        dob: fields.dob,
        street1: fields.street1,
        street2: fields.street2,
        city: fields.city,
        region: fields.region,
        postcode: fields.postcode,
        country: fields.country,
        new: false
      }
    });

    return true;
  }
});

export const sendVerificationEmail = new ValidatedMethod({
  name: "profiles.sendVerificationEmail",

  validate: new SimpleSchema({
    userId: { type: String, optional: true },
    profileId: { type: String }
  }).validator(),

  run(fields) {
    authCheck("profiles.sendVerificationEmail", this.userId);
    //log.info(`sendVerificationEmail`, fields.userId, this.userId);
    const userId = fields.userId ? fields.userId : this.userId;

    let verificationEmailSent = 1;

    if (!this.isSimulation) {
      log.info(`sendVerificationEmail - SERVER`, fields.userId, this.userId);
      let emailResServer = Accounts.sendVerificationEmail(userId);
      let error = false;
      if (!emailResServer) {
        verificationEmailSent = 2;
        error = true;
        log.info(`sendVerificationEmail - SERVER ERROR - email not sent`);
      }

      userSettings.update({owner: fields.userId}, {
        $set: { verificationEmailSent: verificationEmailSent }
      });

      log.info(`sendVerificationEmail - UPDATED PROFILE`, userId);

      if (error) {
        throw new Meteor.Error("Could not send verification email");
      }
    }
  }
});
