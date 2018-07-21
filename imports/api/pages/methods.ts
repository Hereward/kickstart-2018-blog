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

const slugCheck = (props: { slug: string; type: string; current?: string }) => {
  let found: any;
  let valid = false;
  if (props.type === "new") {
    found = Pages.find({ slug: props.slug }).count();
    valid = found === 0;
  } else {
    found = Pages.find({ slug: props.slug }).count();
    //const current = Pages.findOne(props.id);
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

export const createPages = new ValidatedMethod({
  name: "pages.create",

  validate: null,

  run() {
    authCheck("pages.create", this.userId);
    //let admin = false;
    let id: string;

    //Profiles.remove({});

    let exists = Pages.findOne({ name: "about" });

    if (!exists) {
      id = Pages.insert({
        name: "about",
        heading: Meteor.settings.public.defaultContent.about.heading,
        body: Meteor.settings.public.defaultContent.about.body,
        createdAt: new Date(),
        owner: ""
      });
    }

    return id;
  }
});

export const createPage = new ValidatedMethod({
  name: "page.create",
  validate: new SimpleSchema({
    id: { type: String, optional: true },
    image_id: { type: String },
    title: { type: String },
    summary: { type: String },
    slug: { type: String },
    body: { type: String }
  }).validator(),

  run(fields) {
    authCheck("pages.create", this.userId);
    log.info(`createPage`, fields);

    slugCheck({ slug: fields.slug, type: "new" });

    Pages.insert({
      image_id: fields.image_id,
      title: fields.title,
      body: fields.body,
      summary: fields.summary,
      slug: fields.slug
    });

    return true;
  }
});

export const updatePage = new ValidatedMethod({
  name: "pages.update",
  validate: new SimpleSchema({
    id: { type: String },
    image_id: { type: String },
    title: { type: String },
    summary: { type: String },
    slug: { type: String },
    body: { type: String }
  }).validator(),

  run(fields) {
    authCheck("pages.update", this.userId);
    log.info(`updatePage`, fields);

    const current = Pages.findOne(fields.id);

    slugCheck({ slug: fields.slug, type: "update", current: current.slug });

    Pages.update(fields.id, {
      $set: {
        image_id: fields.image_id,
        title: fields.title,
        body: fields.body,
        summary: fields.summary || current.summary,
        slug: fields.slug || current.slug
      }
    });

    return true;
  }
});
