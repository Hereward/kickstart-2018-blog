/// <reference path="../../../index.d.ts" />
import { Accounts } from "meteor/accounts-base";
import "./api";
import { purgeInactiveSessions } from "../../api/sessions/methods";

/*
Accounts.config({
  loginExpirationInDays: 5
});
*/


Accounts.urls.resetPassword = token => Meteor.absoluteUrl(`forgot-password-reset/${token}`);
Accounts.urls.verifyEmail = token => Meteor.absoluteUrl(`verify-email/${token}`);
Accounts.emailTemplates.from = "Meteor Kickstart <postmaster@mg.truthnews.com.au>";

Accounts.onLogin(user => {
  let id = user.user._id;
  purgeInactiveSessions(id);
});

Accounts.onLogout(user => {});

let smtp = Meteor.settings.private.smtp;

let env = `smtp://${encodeURIComponent(smtp.username)}:${encodeURIComponent(smtp.password)}@${encodeURIComponent(
  smtp.server
)}:${smtp.port}`;

process.env.MAIL_URL = env;
