///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Comments } from "./publish";
import { sanitize } from "../../modules/library";

const authCheck = (methodName, userId) => {
  let auth = true;
  if (!userId) {
    auth = false;
    console.log(`authCheck (${methodName}) - NO USER ID`);
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
  return auth;
};

export const updateComment = new ValidatedMethod({
  name: "comment.edit",
  validate: new SimpleSchema({
    id: { type: String },
    body: { type: String }
  }).validator(),

  run(fields) {
    authCheck("comment.edit", this.userId);
    Comments.update(fields.id, {
      $set: {
        publish: true,
        body: sanitize({ type: "html", content: fields.body }),
        modified: new Date()
      }
    });

    return true;
  }
});

export const deleteComment = new ValidatedMethod({
  name: "comment.delete",
  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("comment.delete", this.userId);
      Comments.remove(fields.id);
    }
    return true;
  }
});

export const createComment = new ValidatedMethod({
  name: "comment.create",
  validate: new SimpleSchema({
    postId: { type: String },
    parentId: { type: String, optional: true },
    body: { type: String }
  }).validator(),

  run(fields) {
    authCheck("comment.create", this.userId);

    Comments.insert({
      publish: true,
      body: sanitize({ type: "html", content: fields.body }),
      authorId: this.userId,
      postId: fields.postId,
      parentId: fields.parentId || null,
      modified: new Date(),
      created: new Date()
    });

    return true;
  }
});
