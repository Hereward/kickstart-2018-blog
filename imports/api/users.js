import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";

// Server

/*
Meteor.publish('userData', function () {
  if (this.userId) {
    return Meteor.users.find({ _id: this.userId }, {
      fields: { private_key: 1,  auth_verified: 1 }
    });
  } else {
    this.ready();
  }
});

*/

Accounts.onCreateUser((options, user) => {
  if (typeof options.private_key !== "undefined") {
    user.private_key = options.private_key;
  }

  if (typeof options.auth_verified !== "undefined") {
    user.auth_verified = options.auth_verified;
  }

  if (options.profile) {
    user.profile = options.profile;
  }

  // Don't forget to return the new user object at the end!
  return user;
});

Meteor.publish("userData", function userData() {
  if (!this.userId) {
    return null;
  }
  const options = {
    fields: { private_key: 1, auth_verified: 1 }
  };

  return Meteor.users.find(this.userId, options);
});

Meteor.users.allow({ update: () => true });

Meteor.methods({
  "user.sendForgotPasswordEmail": function sfe(email) {
    check(email, String);
    console.log(`user.sendForgotPasswordEmail: [${email}] `);
    let user = Accounts.findUserByEmail(email);
    if (user) {
      //console.log(`USER: [${user}] `);
      console.log(`user.sendForgotPasswordEmail: ID = [${user._id}]`);
      //let result = Accounts.sendResetPasswordEmail(user._id);
      //return result;

      let options = {};
      options.email = email;

      Accounts.forgotPassword(options, function fp(err) {
        if (err) {
          console.log("error: " + err.reason);
        } else {
          console.log("Success!");
        }
      });
      return true;
    } else {
      console.log(`USER DOES NOT EXIST`);
      return false;
    }
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
