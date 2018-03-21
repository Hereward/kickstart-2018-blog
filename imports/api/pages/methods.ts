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

export const setDefaultContent = new ValidatedMethod({
  name: "pages.setDefaultContent",
  validate: new SimpleSchema({
    name: { type: String }
  }).validator(),

  run(fields) {
    let heading = "";
    let body = "";

    if (fields.name === "about") {
      heading = Meteor.settings.public.defaultContent.about.heading;
      body = Meteor.settings.public.defaultContent.about.body;
    }

    Pages.update(
      { name: fields.name },
      {
        name: fields.name,
        heading: heading,
        body: body
      }
    );

    return true;
  }
});

export const wipeContent = new ValidatedMethod({
  name: "pages.wipeContent",
  validate: new SimpleSchema({}).validator(),
  run() {
    if (!this.isSimulation) {
      Pages.remove({});

      Pages.insert({
        name: "about",
        heading: "",
        body: "",
        createdAt: new Date(),
        owner: ""
      });
      return true;
    }
  }
});


export const refreshDefaultContent = () => {
  wipeContent.call({}, err => {
    if (err) {
      console.log(`pages wipeContent failed`, err);
    } else {
      setDefaultContent.call({ name: "about" }, err => {
        if (err) {
          console.log(`Pages - refreshDefaultContent - setDefaultContent (about) failed`, err);
        }
      });
    }
  });
};

export const createPage = new ValidatedMethod({
  name: "pages.create",

  validate: new SimpleSchema({
    name: { type: String },
    heading: { type: String },
    body: { type: String }
  }).validator(),

  run(fields) {
    authCheck("pages.create", this.userId);

    let id = Pages.insert({
      name: "",
      heading: "",
      body: "",
      createdAt: new Date(),
      owner: this.userId
    });

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
    authCheck("pages.update", this.userId);

    Pages.update(fields.id, {
      $set: {
        heading: fields.heading,
        body: fields.body
      }
    });

    return true;
  }
});



