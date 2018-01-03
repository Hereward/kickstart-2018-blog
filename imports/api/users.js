import { Meteor } from 'meteor/meteor';

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

  if (typeof options.private_key !== 'undefined') {
    user.private_key = options.private_key;
  }

  if (typeof options.auth_verified !== 'undefined') {
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
