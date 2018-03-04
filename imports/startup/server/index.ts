import { Accounts } from "meteor/accounts-base";
import "./api";

Accounts.config({
  loginExpirationInDays: 0.16
});
Accounts.urls.resetPassword = token => Meteor.absoluteUrl(`forgot-password-reset/${token}`);
Accounts.urls.verifyEmail = token => Meteor.absoluteUrl(`verify-email/${token}`);
Accounts.emailTemplates.from = "Personal Web Wallet <postmaster@mg.truthnews.com.au>";
let smtp = Meteor.settings.private.smtp;

let env = `smtp://${encodeURIComponent(smtp.username)}:${encodeURIComponent(smtp.password)}@${encodeURIComponent(
  smtp.server
)}:${smtp.port}`;

console.log(`SERVER ENV =[${env}]`);
process.env.MAIL_URL = env;
