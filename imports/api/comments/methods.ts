///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import * as truncate from "truncate-html";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Comments } from "./publish";
import { can as userCan } from "../../modules/user";

const authCheck = (methodName, userId) => {
  let auth = true;
  if (!userId) {
    auth = false;
    console.log(`authCheck (${methodName}) - NO USER ID`);
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
  return auth;
};

export const createComment = new ValidatedMethod({
  name: "comment.create",
  validate: new SimpleSchema({
    id: { type: String, optional: true },
    postId: { type: String },
    body: { type: String }
  }).validator(),

  run(fields) {
    authCheck("comment.create", this.userId);

    Comments.insert({
      body: fields.body,
      author: this.userId,
      postId: fields.postId,
      parentId: fields.parentId || "",
      modified: new Date(),
      published: new Date()
    });

    return true;
  }
});

export const updateCommentInline = new ValidatedMethod({
  name: "comment.updateInline",
  validate: new SimpleSchema({
    id: { type: String },
    title: { type: String }
  }).validator(),

  run(fields) {
    authCheck("comment.updateInline", this.userId);
    log.info(`comment.updateInline`, fields);

    const current = Comments.findOne(fields.id);

    const allow = userCan({ threshold: "creator", owner: current.author });

    if (!allow) {
      console.log(`comment.updateInline - PERMISSION DENIED`);
      throw new Meteor.Error(`not-authorized [comment.updateInline]`, "PERMISSION DENIED");
    }

    Comments.update(fields.id, {
      $set: {
        body: fields.body,
        modified: new Date()
      }
    });

    return true;
  }
});

export const updateComment = new ValidatedMethod({
  name: "comment.update",
  validate: new SimpleSchema({
    id: { type: String },
    body: { type: String }
  }).validator(),

  run(fields) {
    authCheck("comment.update", this.userId);
    const current = Comments.findOne(fields.id);

    Comments.update(fields.id, {
      $set: {
        body: fields.body,
        modified: new Date()
      }
    });

    return true;
  }
});
