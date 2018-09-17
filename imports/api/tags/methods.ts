///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Tags } from "./publish";

const authCheck = (methodName, userId) => {
  let auth = true;
  if (!userId) {
    auth = false;
    console.log(`authCheck (${methodName}) - NO USER ID`);
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
  return auth;
};

export const updateTag = new ValidatedMethod({
  name: "tag.update",
  validate: new SimpleSchema({
    id: { type: String },
    title: { type: String }
  }).validator(),

  run(fields) {
    authCheck("tag.update", this.userId);
    Tags.update(fields.id, {
      $set: {
        title: fields.title
      }
    });

    return true;
  }
});

export const deleteTag = new ValidatedMethod({
  name: "tag.delete",
  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("comment.delete", this.userId);

      Tags.remove(fields.id);
    }
    return true;
  }
});

export const createTag = new ValidatedMethod({
  name: "tag.create",
  validate: new SimpleSchema({
    id: { type: String },
    title: { type: String }
  }).validator(),

  run(fields) {
    authCheck("comment.create", this.userId);
    Tags.insert({
      title: fields.title
    });

    return true;
  }
});
