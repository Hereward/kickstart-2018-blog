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

export const refreshDefaultContent = () => {
  console.log(`refreshDefaultContent`);
  wipeContent.call({}, err => {
    if (err) {
      console.log(`wipeContent failed`, err);
    } else {
      setDefaultContent.call({ name: "about" }, err => {
        if (err) {
          console.log(`refreshDefaultContent - setDefaultContent (about) failed`, err);
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
    console.log(`pages.create`);
    authCheck("pages.create", this.userId);

    let id = Pages.insert({
      name: "",
      heading: "",
      body: "",
      createdAt: new Date(),
      owner: this.userId
    });

    console.log(`pages.create - DONE!`);
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
    console.log(`pages.update`);
    authCheck("pages.update", this.userId);

    Pages.update(fields.id, {
      $set: {
        heading: fields.heading,
        body: fields.body
      }
    });

    console.log(`pages.update - DONE!`);
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
      console.log(`pages.wipeContent - DONE!`);
      return true;
    }
  }
});

export const setDefaultContent = new ValidatedMethod({
  name: "pages.setDefaultContent",
  validate: new SimpleSchema({
    name: { type: String }
  }).validator(),

  run(fields) {
    //console.log(`pages.setDefaultContent`);
    let heading = "";
    let body = "";
    //authCheck("pages.setDefaultContent", this.userId);

    if (fields.name === "about") {
      heading = Meteor.settings.public.defaultContent.about.heading;
      body = Meteor.settings.public.defaultContent.about.body;
    } else if (fields.name === "home") {
      heading = "Home Page";
      body = "<p>This is the Home page.</p>";
    }

    Pages.update(
      { name: fields.name },
      {
        name: fields.name,
        heading: heading,
        body: body
      }
    );

    console.log(`pages.setDefaultContent (${fields.name}) - DONE!`);
    return true;
  }
});
