///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import * as truncate from "truncate-html";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Posts } from "./publish";

const authCheck = (methodName, userId) => {
  let auth = true;
  if (!userId) {
    auth = false;
    console.log(`authCheck (${methodName}) - NO USER ID`);
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
  return auth;
};

const slugCheck = (props: { slug: string; type: string; current?: string }) => {
  let found: any;
  let valid = false;
  if (props.type === "new") {
    found = Posts.find({ slug: props.slug }).count();
    valid = found === 0;
  } else {
    found = Posts.find({ slug: props.slug }).count();
    const unchanged = props.current === props.slug;
    if (unchanged) {
      valid = true;
    } else {
      valid = found === 0;
    }
  }
  log.info(`slugValid()`, valid);
  if (!valid) {
    slugError();
  }
};

function slugError() {
  throw new Meteor.Error(`Invalid slug`, "Slug must be unique.");
}

function truncateHTML(html) {
  const trunc = truncate(html, 50, { byWords: true });
  return trunc;
}

export const createPost = new ValidatedMethod({
  name: "post.create",
  validate: new SimpleSchema({
    id: { type: String, optional: true },
    image_id: { type: String },
    title: { type: String },
    summary: { type: String },
    slug: { type: String },
    body: { type: String },
    allowComments: { type: Boolean }
  }).validator(),

  run(fields) {
    authCheck("post.create", this.userId);
    const truncatedBody = truncateHTML(fields.body);

    slugCheck({ slug: fields.slug, type: "new" });

    Posts.insert({
      image_id: fields.image_id,
      title: fields.title,
      body: fields.body,
      truncatedBody: truncatedBody,
      summary: fields.summary,
      slug: fields.slug,
      allowComments: fields.allowComments,
      closeComments: false,
      author: this.userId,
      modified: new Date(),
      published: new Date()
    });

    return true;
  }
});

export const updatePostInline = new ValidatedMethod({
  name: "posts.updateInline",
  validate: new SimpleSchema({
    id: { type: String },
    title: { type: String },
    body: { type: String, optional: true },
  }).validator(),

  run(fields) {
    authCheck("posts.updateInline", this.userId);
    log.info(`posts.updateInline`, fields);

    Posts.update(fields.id, {
      $set: {
        title: fields.title,
        body: fields.body,
        modified: new Date()
      }
    });

    return true;
  }
});

export const updatePost = new ValidatedMethod({
  name: "posts.update",
  validate: new SimpleSchema({
    id: { type: String },
    image_id: { type: String },
    title: { type: String },
    summary: { type: String },
    slug: { type: String },
    body: { type: String },
    closeComments: { type: Boolean }
  }).validator(),

  run(fields) {
    authCheck("posts.update", this.userId);
    const truncatedBody = truncateHTML(fields.body);
    log.info(`updatePost`, truncatedBody);
    const current = Posts.findOne(fields.id);
    slugCheck({ slug: fields.slug, type: "update", current: current.slug });

    Posts.update(fields.id, {
      $set: {
        image_id: fields.image_id,
        title: fields.title,
        body: fields.body,
        truncatedBody: truncatedBody,
        summary: fields.summary || current.summary,
        closeComments: fields.closeComments,
        slug: fields.slug || current.slug,
        modified: new Date()
      }
    });

    return true;
  }
});
