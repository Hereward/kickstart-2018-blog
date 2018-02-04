import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";

//let Future = Npm.require('fibers/future'); 

Accounts.onCreateUser((options, user) => {
  //let objData = JSON.stringify(options);
  //console.log(`options= [${objData}]`);

  /*
  if (typeof options.enhancedAuth !== "undefined") {
    user.enhancedAuth = {};
    user.enhancedAuth.verified = options.enhancedAuth.verified;
    user.enhancedAuth.private_key = options.enhancedAuth.private_key;
    user.enhancedAuth.attempts = 0;
  }

  if (typeof options.verificationEmailSent !== "undefined") {
    user.verificationEmailSent = options.verificationEmailSent;
  }

  */

  // user.profile = options.profile || {firstname: '', lastname: ''};
/*
  if (options.profile) {
    user.profile = options.profile;
  }
  */

  return user;
});

/*
Meteor.publish("userData", function userData() {
  if (!this.userId) {
    return this.ready();
  }
  const options = {
    fields: { 'enhancedAuth.private_key': 1, 'enhancedAuth.verified': 1, 'enhancedAuth.attempts': 1, verificationEmailSent: 1 }
  };

  return Meteor.users.find(this.userId, options);
});
*/

Meteor.users.allow({ update: () => true });

Meteor.methods({
  "user.sendVerificationEmail": function sve() {
    let emailRes = false;
    console.log(`user.sendVerificationEmail:BEGIN`);

    emailRes = Accounts.sendVerificationEmail(this.userId);
    console.log(`emailRes = [${emailRes}]`);
    let verificationEmailSent = 2;
    let output = false;

    if (emailRes) {
      verificationEmailSent = 1;
      output = true;
    }

    Meteor.users.update(this.userId, {
      $set: {
        verificationEmailSent: verificationEmailSent
      }
    });

    return output;
  }
});

/*
Meteor.users.allow({
  update: function (userId, user) {
    return true;

    
     * Don't use `return true` in production!
     * You probably need something like this:
     * return Meteor.users.findOne(userId).profile.isAdmin;
     *
  }
});

*/
