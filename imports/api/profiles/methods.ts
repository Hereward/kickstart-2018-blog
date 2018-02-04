import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Profiles } from './publish';

const authCheck = (userId, methodName) => {
  if (!userId) {
    throw new Meteor.Error(
      `not-authorized [${methodName}]`,
      "Must be logged in to access this function."
    );
  }
};

export const createProfile = new ValidatedMethod({

    name: 'profiles.create',

    validate: new SimpleSchema({
      fname: { type: String },
      initial: { type: String },
      lname: { type: String },
    }).validator(),

    run() {

      
      console.log(`profiles.create [SERVER]`);
      if (!this.userId) {
        throw new Meteor.Error('not-authorized');
      }

      let id = Profiles.insert({
        fname: "Adolf",
        initial: "K",
        lname: "Hitler",
        street1: "",
        street2: "",
        city: "",
        region: "",
        postcode: "",
        country: "",
        verificationEmailSent: 0,
        createdAt: new Date(),
        owner: this.userId
      });

      console.log(`profiles.create - DONE!`);
      return id;
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
          //throw new Meteor.Error("Could not send verification email");
        }
      }
  
      Profiles.update(fields.id, {
        $set: { verificationEmailSent: verificationEmailSent }
      });
      console.log(`profiles.sendVerificationEmail - DONE!`);
    }
  });

