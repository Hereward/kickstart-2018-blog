import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Pages } from "./publish";
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
  //log.info(`slugValid()`, valid);
  if (!valid) {
    slugError();
  }
};

function slugError() {
  throw new Meteor.Error(`Invalid slug`, "Slug must be unique.");
}



export const createPage = new ValidatedMethod({
  name: "page.create",
  validate: new SimpleSchema({
    id: { type: String, optional: true },
    tags: { type: String, optional: true},
    publish: { type: Boolean },
    showImage: { type: Boolean },
    image_id: { type: String },
    title: { type: String },
    summary: { type: String },
    slug: { type: String },
    body: { type: String },
    allowComments: { type: Boolean }
  }).validator(),

  run(fields) {
    authCheck("pages.create", this.userId);
    //log.info(`createPage`, fields);

    slugCheck({ slug: fields.slug, type: "new" });

    Pages.insert({
      publish: fields.publish,
      showImage: fields.showImage,
      tags: fields.tags || "",
      image_id: fields.image_id,
      title: fields.title,
      body: fields.body,
      summary: fields.summary,
      slug: fields.slug,
      allowComments: fields.allowComments,
      closeComments: false,
      modified: new Date(),
      created: new Date()
    });

    return true;
  }
});

export const updatePage = new ValidatedMethod({
  name: "pages.update",
  validate: new SimpleSchema({
    id: { type: String },
    tags: { type: String, optional: true},
    publish: { type: Boolean },
    showImage: { type: Boolean },
    image_id: { type: String },
    title: { type: String },
    summary: { type: String },
    slug: { type: String },
    body: { type: String, optional: true },
    closeComments: { type: Boolean }
  }).validator(),

  run(fields) {
    authCheck("pages.update", this.userId);
    //log.info(`updatePage`, fields);

    const current = Pages.findOne(fields.id);

    slugCheck({ slug: fields.slug, type: "update", current: current.slug });

    Pages.update(fields.id, {
      $set: {
        publish: fields.publish,
        showImage: fields.showImage,
        tags: fields.tags || "",
        image_id: fields.image_id,
        title: fields.title,
        body: fields.body,
        summary: fields.summary || current.summary,
        closeComments: fields.closeComments,
        slug: fields.slug || current.slug,
        modified: new Date()
      }
    });

    return true;
  }
});



