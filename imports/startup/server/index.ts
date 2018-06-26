/// <reference path="../../../index.d.ts" />
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";
import "../../server/api";
import { purgeInactiveSessions } from "../../api/sessions/methods";

function initRoles() {
  const defaultRoles = Meteor.settings.public.admin.roles; 
  defaultRoles.forEach(role => {
    //let allRoles = Roles.getAllRoles().fetch();
    Roles.createRole(role, { unlessExists: true });
  });
}

Accounts.config({
  loginExpirationInDays: 3650
});

Accounts.urls.resetPassword = token => Meteor.absoluteUrl(`forgot-password-reset/${token}`);
Accounts.urls.verifyEmail = token => Meteor.absoluteUrl(`members/verify-email/${token}`);
Accounts.urls.enrollAccount  = token => Meteor.absoluteUrl(`members/enroll/${token}`);
Accounts.emailTemplates.from = "Meteor Kickstart <postmaster@mg.truthnews.com.au>";

Accounts.onLogin(user => {
  let id = user.user._id;
  purgeInactiveSessions(id);
});

Accounts.onLogout(user => {});

initRoles();

let smtp = Meteor.settings.private.smtp;

let env = `smtp://${encodeURIComponent(smtp.username)}:${encodeURIComponent(smtp.password)}@${encodeURIComponent(
  smtp.server
)}:${smtp.port}`;

process.env.MAIL_URL = env;
//process.env.DISABLE_WEBSOCKETS=1;
