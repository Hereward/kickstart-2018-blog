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
    metaDescription: { type: String },
    name: { type: String },
    slug: { type: String },
    body: { type: String }
  }).validator(),

  run(fields) {
    authCheck("pages.create", this.userId);
    log.info(`createPage`, fields);

    Pages.insert({
      image_id: fields.image_id,
      title: fields.title,
      body: fields.body,
      metaDescription: fields.metaDescription,
      name: fields.name,
      slug: fields.slug
    });

    return true;
  }
});

export const updatePage = new ValidatedMethod({
  name: "pages.update",
  validate: new SimpleSchema({
    id: { type: String },
    image_id: { type: String, optional: true},
    title: { type: String },
    metaDescription: { type: String },
    name: { type: String },
    slug: { type: String },
    body: { type: String }
  }).validator(),

  run(fields) {
    authCheck("pages.update", this.userId);
    log.info(`updatePage`, fields);
    const current = Pages.findOne(fields.id);

    Pages.update(fields.id, {
      $set: {
        title: fields.title,
        body: fields.body,
        metaDescription: fields.metaDescription || current.metaDescription,
        name: fields.name || current.name,
        slug: fields.slug || current.slug
      }
    });

    return true;
  }
});
