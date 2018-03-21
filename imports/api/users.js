/* xx
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";


Accounts.onCreateUser((options, user) => {
 
  return user;
});



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

*/


