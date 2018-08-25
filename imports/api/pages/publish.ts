import { Meteor } from "meteor/meteor";
//import { Mongo } from "meteor/mongo";
declare var Mongo: any;

export const Pages = new Mongo.Collection("pages");

if (Meteor.isServer) {
  Meteor.publish("pages", function pagesPublication() {
    return Pages.find();
  });

  Meteor.startup(function pagesStart() {
    const myPages = Pages.find();
    if (!myPages.count()) {
      Pages.insert({
        summary: Meteor.settings.public.defaultContent.about.title,
        image_id: "",
        tags: "",
        slug: "about",
        title: Meteor.settings.public.defaultContent.about.title,
        body: Meteor.settings.public.defaultContent.about.body,
        allowComments: false,
        closeComments: false,
        modified: new Date(),
        created: new Date(),
      });
    }
  });
}
