///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { userSessions } from "./publish";

const authCheck = (userId, methodName) => {
  if (!userId) {
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
};

export const createUserSession = new ValidatedMethod({
  name: "UserSession.create",

  validate: null,

  run() {
    //console.log(`session.create start`);
    //console.log(`SessionMethods.createUserSession EXECUTED`);
    authCheck("UserSession.create", this.userId);

    let inactivityTimeout: any;
    inactivityTimeout = Meteor.settings.public.session.inactivityTimeout;
    //inactivityTimeout = 3600000;

    let now = new Date();
    let expires = new Date(Date.now() + inactivityTimeout);

    let id = "";

    userSessions.remove({ owner: this.userId });

    id = userSessions.insert({
      expired: false,
      active: true,
      expiresOn: expires,
      createdAt: now,
      owner: this.userId
    });

    //console.log(`session.create - DONE! userId=[${this.userId}]`);
    return id;
  }
});

export const killSession = new ValidatedMethod({
  name: "UserSession.kill",
  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),

  run(fields) {
    //console.log(`session.kill`, fields.id);
    authCheck("session.kill", this.userId);
    //let ownerId = this.userId;
    let sessionRecord: any;

    sessionRecord = userSessions.findOne({ owner: fields.id });
    if (sessionRecord) {
      console.log(`UserSession.kill - KILL NOW`, fields.id);
      userSessions.update(
        { owner: fields.id },
        {
          $set: {
            expired: true
          }
        }
      );
    }

    //console.log(`session.kill`);
    return true;
  }
});

export const keepAliveUserSession = new ValidatedMethod({
  name: "UserSession.keepAlive",

  validate: new SimpleSchema({
    id: { type: String },
    activityDetected: {type: Boolean}
  }).validator(),

  run(fields) {
    //console.log(`session.create start`);
    //console.log(`UserSession.keepAlive EXECUTED`);
    authCheck("UserSession.keepAlive", fields.id);

    let inactivityTimeout: any;
    inactivityTimeout = Meteor.settings.public.session.inactivityTimeout;

    inactivityTimeout = 3600000;
    let now: any;
    now = new Date();

    let id = "";

    let sessionRecord: any;
    sessionRecord = userSessions.findOne({ owner: fields.id });

    if (sessionRecord) {
      let diff = now - sessionRecord.expiresOn;
      //console.log(`UserSession.keepAlive - sessionRecord found`, fields.id, now, sessionRecord.expiresOn);
      console.log(`UserSession.keepAlive - diff =[${diff}]`);

      if (diff > 0) {
        //console.log(`NEED TO KILL`);
        //Meteor.call("UserSession.kill");
        killSession.call({id: fields.id}, () => {});
      } else if (fields.activityDetected){
        console.log(`UserSession.keepAlive - activityDetected`);
        //console.log(`KILL NOT REQUIRED`);
        let expires = new Date(Date.now() + inactivityTimeout);
        userSessions.update(
          { owner: fields.id },
          {
            $set: {
              expiresOn: expires
            }
          }
        );
      }
    }

    return id;
  }
});

export const destroySession = new ValidatedMethod({
  name: "session.destroy",
  validate: null,

  run(fields) {
    //console.log(`session.destroy`);
    authCheck("session.destroy", this.userId);
    let ownerId = this.userId;
    userSessions.remove({ owner: ownerId });
    //console.log(`session.destroy`);
    return true;
  }
});
