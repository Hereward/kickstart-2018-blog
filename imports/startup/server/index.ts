/// <reference path="../../../index.d.ts" />
import { Accounts } from "meteor/accounts-base";
import { keepAliveUserSession }  from "../../api/sessions/methods";
import "./api";

/*
Accounts.config({
  loginExpirationInDays: 5
});
*/

Accounts.urls.resetPassword = token => Meteor.absoluteUrl(`forgot-password-reset/${token}`);
Accounts.urls.verifyEmail = token => Meteor.absoluteUrl(`verify-email/${token}`);
Accounts.emailTemplates.from = "Meteor Kickstart <postmaster@mg.truthnews.com.au>";

Accounts.onLogin((user) => {
  let id = user.user._id;
  console.log(`Login`, Meteor.userId(), id);
  keepAliveUserSession.call({id: id}, (err, res) => {
    if (err) {
      console.log(`keepAliveUserSession onLogin error`, err.reason);
    }
  });
});

Accounts.onLogout(() => {
  console.log(`Logout`, Meteor.userId());
});

let smtp = Meteor.settings.private.smtp;

let env = `smtp://${encodeURIComponent(smtp.username)}:${encodeURIComponent(smtp.password)}@${encodeURIComponent(
  smtp.server
)}:${smtp.port}`;

console.log(`SERVER ENV =[${env}]`);
process.env.MAIL_URL = env;
