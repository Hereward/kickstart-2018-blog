//import { Meteor } from "meteor/meteor";
//import { Email } from "meteor/email";
import { Accounts } from "meteor/accounts-base";
import './api';

//let process = {env: {MAIL_URL: 'jam'}};


//Meteor.startup(() => {
  Accounts.urls.resetPassword = token => Meteor.absoluteUrl(`forgot-password-reset/${token}`);
  Accounts.urls.verifyEmail = token => Meteor.absoluteUrl(`verify-email/${token}`);
  Accounts.emailTemplates.from = 'Personal Web Wallet <postmaster@mg.truthnews.com.au>';
  let smtp = Meteor.settings.private.smtp;

  let env = `smtp://${encodeURIComponent(smtp.username)}:${encodeURIComponent(
    smtp.password
  )}@${encodeURIComponent(smtp.server)}:${smtp.port}`;

  console.log(`SERVER ENV =[${env}]`);
  process.env.MAIL_URL = env;
//});