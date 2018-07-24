///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
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

export const createPost = new ValidatedMethod({
  name: "post.create",
  validate: new SimpleSchema({
    id: { type: String, optional: true },
    image_id: { type: String },
    title: { type: String },
    summary: { type: String },
    slug: { type: String },
    body: { type: String },
    allowComments: { type: Boolean },
    modified: { type: Date },
    published: { type: Date }
  }).validator(),

  run(fields) {
    authCheck("post.create", this.userId);
    log.info(`createPost`, fields);

    slugCheck({ slug: fields.slug, type: "new" });

    Posts.insert({
      image_id: fields.image_id,
      title: fields.title,
      body: fields.body,
      summary: fields.summary,
      slug: fields.slug,
      allowComments: fields.allowComments,
      closeComments: false,
      modified: fields.modified,
      published: fields.published
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
    closeComments: { type: Boolean },
    modified: { type: Date }
  }).validator(),

  run(fields) {
    authCheck("posts.update", this.userId);
    log.info(`updatePost`, fields);
    const current = Posts.findOne(fields.id);
    slugCheck({ slug: fields.slug, type: "update", current: current.slug });

    Posts.update(fields.id, {
      $set: {
        image_id: fields.image_id,
        title: fields.title,
        body: fields.body,
        summary: fields.summary || current.summary,
        closeComments: fields.closeComments,
        slug: fields.slug || current.slug,
        modified: fields.modified
      }
    });

    return true;
  }
});
