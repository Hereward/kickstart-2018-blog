import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Profiles } from "./publish";

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
  //log.info("newProfile()", name);

  let id = Profiles.insert({
    screenName: nameArray[0],
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
    image_id: "",
    verificationEmailSent: 0,
    new: true,
    createdAt: new Date(),
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
    image_id: { type: String }
  }).validator(),

  run(fields) {
    log.info(`profileImage.update`, fields.id, fields.image_id);
    authCheck("profileImage.update", this.userId);

    Profiles.update(fields.id, {
      $set: {
        image_id: fields.image_id
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

      Profiles.update(fields.profileId, {
        $set: { verificationEmailSent: verificationEmailSent }
      });

      log.info(`sendVerificationEmail - UPDATED PROFILE`, userId, verificationEmailSent);

      if (error) {
        throw new Meteor.Error("Could not send verification email");
      }
    }
  }
});
