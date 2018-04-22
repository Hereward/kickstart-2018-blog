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

export const createProfile = new ValidatedMethod({
  name: "profiles.create",

  validate: new SimpleSchema({
    fname: { type: String },
    initial: { type: String },
    lname: { type: String }
  }).validator(),

  run() {
    authCheck("profiles.create", this.userId);
    let admin = false;

    if (!this.isSimulation) {
      admin = (Meteor.settings.private.adminEmail === Meteor.user().emails[0].address);
    }

    let id = Profiles.insert({
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
      owner: this.userId,
      admin: admin
    });

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
    authCheck("profiles.update", this.userId);

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
    id: { type: String }
  }).validator(),

  run(fields) {
    authCheck("profiles.sendVerificationEmail", this.userId);

    let verificationEmailSent = 1;

    if (!this.isSimulation) {
      let emailResServer = Accounts.sendVerificationEmail(this.userId);
      if (!emailResServer) {
        verificationEmailSent = 2;
        throw new Meteor.Error("Could not send verification email");
      }
    }

    Profiles.update(fields.id, {
      $set: { verificationEmailSent: verificationEmailSent }
    });
  }
});
