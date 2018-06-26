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
        name: "about",
        heading: Meteor.settings.public.defaultContent.about.heading,
        body: Meteor.settings.public.defaultContent.about.body,
        createdAt: new Date(),
        owner: ""
      });
    }
  });
}
