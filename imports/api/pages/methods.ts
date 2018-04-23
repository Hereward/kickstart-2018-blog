import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Pages } from "./publish";

const authCheck = (methodName, userId) => {
  let auth = true;
  if (!userId) {
    auth = false;
    console.log(`authCheck (${methodName}) - NO USER ID`);
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
  return auth;
};


export const updatePage = new ValidatedMethod({
  name: "pages.update",
  validate: new SimpleSchema({
    id: { type: String },
    heading: { type: String },
    body: { type: String }
  }).validator(),

  run(fields) {
    authCheck("pages.update", this.userId);

    log.info(`updatePage`, fields);

    Pages.update(fields.id, {
      $set: {
        heading: fields.heading,
        body: fields.body
      }
    });

    return true;
  }
});
