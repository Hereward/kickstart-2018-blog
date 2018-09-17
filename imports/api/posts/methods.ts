///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import * as truncate from "truncate-html";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Posts } from "./publish";
import { Comments } from "../comments/publish";
import { formatPlainText, sanitize } from "../../modules/library";

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
    tags: { type: String, optional: true },
    publish: { type: Boolean },
    showImage: { type: Boolean },
    image_id: { type: String },
    title: { type: String },
    summary: { type: String },
    slug: { type: String },
    body: { type: String },
    allowComments: { type: Boolean },
    type: { type: String }
  }).validator(),

  run(fields) {
    authCheck("post.create", this.userId);
    const truncatedBody = truncateHTML(fields.body);
    if (!fields.summary) {
      fields.summary = formatPlainText({ text: fields.body, wordCount: 100 });
    }

    slugCheck({ slug: fields.slug, type: "new" });

    Posts.insert({
      publish: fields.publish,
      showImage: fields.showImage,
      tags: sanitize({ type: "text", content: fields.tags }) || "",
      image_id: fields.image_id,
      title: sanitize({ type: "text", content: fields.title }),
      body: fields.body,
      truncatedBody: sanitize({ type: "html", content: truncatedBody }),
      summary: sanitize({ type: "text", content: fields.summary }),
      slug: sanitize({ type: "text", content: fields.slug }),
      allowComments: fields.allowComments,
      type: fields.type,
      closeComments: false,
      authorId: this.userId,
      modified: new Date(),
      created: new Date()
    });

    return true;
  }
});

export const deletePost = new ValidatedMethod({
  name: "post.delete",
  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),

  run(fields) {
    if (!this.isSimulation) {
      authCheck("posts.deletePost", this.userId);
      Posts.remove(fields.id);
      Comments.remove({ postId: fields.id });
    }
    return true;
  }
});

export const updatePost = new ValidatedMethod({
  name: "posts.update",
  validate: new SimpleSchema({
    id: { type: String },
    authorId: { type: String, optional: true },
    tags: { type: String, optional: true },
    publish: { type: Boolean },
    showImage: { type: Boolean },
    image_id: { type: String },
    title: { type: String },
    summary: { type: String },
    slug: { type: String },
    body: { type: String },
    closeComments: { type: Boolean },
    type: { type: String }
  }).validator(),

  run(fields) {
    authCheck("posts.update", this.userId);
    const truncatedBody = truncateHTML(fields.body);
    if (!fields.summary) {
      fields.summary = formatPlainText({ text: fields.body, wordCount: 100 });
    }
    const current = Posts.findOne(fields.id);
    slugCheck({ slug: fields.slug, type: "update", current: current.slug });

    const updateObj: any = {
      publish: fields.publish,
      showImage: fields.showImage,
      tags: sanitize({ type: "text", content: fields.tags }) || "",
      image_id: fields.image_id,
      title: sanitize({ type: "text", content: fields.title }),
      body: sanitize({ type: "html", content: fields.body }),
      truncatedBody: sanitize({ type: "html", content: truncatedBody }),
      summary: sanitize({ type: "text", content: fields.summary }),
      closeComments: fields.closeComments,
      type: fields.type,
      slug: sanitize({ type: "text", content: fields.slug }) || current.slug,
      modified: new Date()
    };

    if (fields.authorId) {
      updateObj.authorId = fields.authorId;
    }

    Posts.update(fields.id, {
      $set: updateObj
    });

    return true;
  }
});
