import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Auth } from "./publish";


const authCheck = (userId, methodName) => {
  if (!userId) {
    throw new Meteor.Error(`not-authorized [${methodName}]`,'Must be logged in to access this function.');
  }
};

export const createAuth = new ValidatedMethod({
  name: "auth.create",

  validate: new SimpleSchema({
    owner: { type: String }
  }).validator(),

  run(fields) {
    authCheck('auth.create',this.userId);

/*
    console.log(
      `METHODS: auth.create fields.owner = [${fields.owner}] this.userId = [${
        this.userId
      }]`
    );
*/

    let id = Auth.insert({
      verified: false,
      currentAttempts: 0,
      private_key: null,
      verificationEmailSent: 0,
      owner: fields.owner
    });

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
    authCheck('auth.setPrivateKey',this.userId);
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

export const setVerified = new ValidatedMethod({
  name: "auth.setVerified",

  validate: new SimpleSchema({
    verified: { type: Boolean }
  }).validator(),

  run(fields) {
    authCheck('auth.setVerified',this.userId);
    let ownerId = this.userId;
    let authRecord: any;
    authRecord = Auth.findOne({ owner: ownerId });

    //console.log(`auth.setVerified: authRecord`, authRecord);
    /*
    console.log(
      `METHODS: auth.setverified fields.verified = [${
        fields.verified
      }] authRecord._id = [${authRecord._id}] `
    );
    */

    Auth.update(authRecord._id, { $set: { verified: fields.verified } });
    console.log(`auth.setVerified - DONE!`);
  }
});

export const sendVerificationEmail = new ValidatedMethod({
  name: "auth.sendVerificationEmail",

  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),

  run(fields) {
    authCheck('auth.sendVerificationEmail',this.userId);
    
    let verificationEmailSent = 1;

    if (!this.isSimulation) {
      let emailResServer = Accounts.sendVerificationEmail(this.userId);
      if (!emailResServer) {
        verificationEmailSent = 2;
        //throw new Meteor.Error("Could not send verification email");
      }

    }

    //let ownerId = this.userId;
    //let authRecord: any;
    //authRecord = Auth.findOne({ owner: ownerId });

    //console.log(`auth.setVerified: authRecord`, authRecord);
    /*
    console.log(
      `METHODS: auth.sendVerificationEmail fields.verified = [${
        fields.send
      }] authRecord._id = [${authRecord._id}] `
    );
    */

    Auth.update(fields.id, { $set: { verificationEmailSent: verificationEmailSent } });
    console.log(`auth.setVerified - DONE!`);
  }
});