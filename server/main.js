import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";
import { Accounts } from "meteor/accounts-base";
import "../imports/api/tasks.js";
import "../imports/api/users.js";
import "../imports/api/authenticator.js";

Meteor.startup(() => {
  // code to run on server at startup
  Accounts.urls.resetPassword = token => Meteor.absoluteUrl(`forgot-password-reset/${token}`);
  Accounts.emailTemplates.from = 'Personal Web Wallet <postmaster@mg.truthnews.com.au>';
 

  let smtp = Meteor.settings.private.smtp;

  let env = `smtp://${encodeURIComponent(smtp.username)}:${encodeURIComponent(
    smtp.password
  )}@${encodeURIComponent(smtp.server)}:${smtp.port}`;

  console.log(env);
  process.env.MAIL_URL = env;
});
