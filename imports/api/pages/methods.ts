import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Pages } from "./publish";

const authCheck = (userId, methodName) => {
  if (!userId) {
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
};

export const createPage = new ValidatedMethod({
  name: "pages.create",

  validate: new SimpleSchema({
    name: { type: String },
    heading: { type: String },
    body: { type: String }
  }).validator(),

  run(fields) {
    console.log(`pages.create`);
    authCheck("pages.create", this.userId);

    let id = Pages.insert({
      name: "",
      heading: "",
      body: "",
      createdAt: new Date(),
      owner: this.userId
    });

    console.log(`pages.create - DONE!`);
    return id;
  }
});

export const updatePage = new ValidatedMethod({
  name: "pages.update",
  validate: new SimpleSchema({
    id: { type: String },
    heading: { type: String },
    body: { type: String }
  }).validator(),

  run(fields) {
    console.log(`pages.update`);
    authCheck("pages.update", this.userId);

    Pages.update(fields.id, {
      $set: {
        heading: fields.heading,
        body: fields.body
      }
    });

    console.log(`pages.update - DONE!`);
    return true;
  }
});
